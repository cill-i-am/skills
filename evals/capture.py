#!/usr/bin/env python3
"""Capture independent browser evidence for a completed run; never assign a grade."""
import argparse
import json
from pathlib import Path
import signal
import subprocess
import sys
import uuid

from harness import matches_snapshot, read_json, relative_path, serve, write_json

METRICS = """(()=>{const visible=e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height&&getComputedStyle(e).visibility!=='hidden';
return {viewport:{width:innerWidth,height:innerHeight},scrollWidth:document.documentElement.scrollWidth,
bodyText:document.body.innerText,dir:document.documentElement.dir,
items:[...document.querySelectorAll('main,section,h1,h2,p,button,input,label,.member,.row,.avatar,.reference,dd')].filter(visible).map(e=>{
const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,id:e.id,cls:e.className,text:e.textContent.slice(0,160),
x:r.x,y:r.y,width:r.width,height:r.height,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,color:s.color,
background:s.backgroundColor,fontSize:s.fontSize,lineHeight:s.lineHeight,fontVariantNumeric:s.fontVariantNumeric,
overflow:s.overflow,outline:s.outline,transform:s.transform,transition:s.transition,borderRadius:s.borderRadius}})}})()"""
ENLARGE_RTL = """document.documentElement.dir='rtl';
const sizes=[...document.querySelectorAll('body,body *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);
sizes.forEach(([e,n])=>e.style.fontSize=(n*2)+'px')"""


def capture(root, output, browser="agent-browser", enlarged=False, expected_hashes=None):
    if expected_hashes is not None and not matches_snapshot(root, expected_hashes):
        raise ValueError("Fixture no longer matches the recorded outcome; rerun the case")
    session = "eval-" + uuid.uuid4().hex[:12]
    report = {"session": session, "evidence": [], "status": "incomplete"}
    output.mkdir(parents=True, exist_ok=False)

    def call(*args, script=None):
        result = subprocess.run([browser, "--session", session, "--json", *args],
            input=script, capture_output=True, text=True, timeout=90)
        if result.returncode:
            raise RuntimeError("Browser command failed: " + result.stderr)
        data = json.loads(result.stdout)
        if data.get("success") is False or data.get("error"):
            raise RuntimeError("Browser reported an error: " + result.stdout)
        return data

    try:
        with serve(root, True) as url:
            for width in [320, 640, 1280]:
                call("set", "viewport", str(width), "800")
                call("open", url)
                metrics = call("eval", "--stdin", script=METRICS)
                image = output / (str(width) + ".png")
                call("screenshot", str(image))
                if not image.is_file():
                    raise RuntimeError("Screenshot was not saved")
                report["evidence"].append({"width": width, "metrics": metrics, "screenshot": image.name})
            if enlarged:
                call("set", "viewport", "320", "800")
                call("open", url)
                call("eval", "--stdin", script=ENLARGE_RTL)
                metrics = call("eval", "--stdin", script=METRICS)
                call("screenshot", str(output / "rtl-enlarged.png"))
                if not (output / "rtl-enlarged.png").is_file():
                    raise RuntimeError("Enlarged-text screenshot was not saved")
                report["evidence"].append({"mode": "RTL and doubled computed font sizes; not browser zoom",
                                           "metrics": metrics, "screenshot": "rtl-enlarged.png"})
            call("set", "viewport", "640", "800")
            call("open", url)
            report["a11y"] = call("a11y")
            if expected_hashes is not None and not matches_snapshot(root, expected_hashes):
                raise ValueError("Fixture changed during capture")
            report["status"] = "captured"
    except Exception as error:
        report.update(status="error", error=str(error))
        raise
    finally:
        try:
            call("close")
        except Exception as error:
            report.update(status="error", cleanup_error=str(error))
        write_json(output / "capture.json", report)
    if report["status"] != "captured":
        raise RuntimeError("Browser cleanup failed; see capture.json")
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_dir", type=Path)
    parser.add_argument("--case", required=True)
    parser.add_argument("--phase", choices=["before", "after"], required=True)
    parser.add_argument("--browser", default="agent-browser")
    parser.add_argument("--rtl-enlarged", action="store_true")
    args = parser.parse_args()
    relative_path(args.case)
    logs = args.run_dir.resolve() / "cases" / args.case
    result = read_json(logs / "result.json")
    root = logs / "before" if args.phase == "before" else Path(result["workspace"])
    if not (root / "index.html").is_file():
        raise ValueError("Case has no HTML fixture to capture")
    capture(root, logs / ("browser-" + args.phase), args.browser, args.rtl_enlarged, result[args.phase])


if __name__ == "__main__":
    def interrupted(*_args):
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, interrupted)
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        print("Capture failed: " + str(error), file=sys.stderr)
        sys.exit(2)
