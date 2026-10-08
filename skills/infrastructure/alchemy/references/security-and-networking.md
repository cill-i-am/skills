# Security, secrets, DNS, domains, and access

## Separate identities and permissions

Keep infrastructure deployment identity, runtime service identity, end-user identity, and state-store access distinct. A binding can grant a Worker or Lambda permission to a resource; it does not decide whether a particular user may access a particular record. Restrict capabilities to the smallest operation and resource set that satisfies the feature.

Review bootstrap privileges independently. Creating API tokens, IAM roles, OIDC providers, GitHub secrets, or DNS zones is a security mutation even when expressed as code. Do not give the daily app pipeline the same privileges as an admin bootstrap stack.

## Secrets lifecycle

Use the version-compatible Config/Redacted and secret-store APIs. Generate stable secrets through a managed resource rather than `Math.random` during every plan. Unwrap only at the immediate SDK/HTTP boundary that requires a string. Never serialize secrets into ordinary stack outputs, frontend bundles, shell command lines, PR comments, screenshots, or error messages.

Document the owner, reader identities, rotation trigger, revocation path, and redeployment requirements. A rotation that breaks active Workflow steps or old canary versions is an application compatibility change. Test both current and newly issued credentials during a controlled transition where supported.

## Cloudflare Access and Turnstile

Use Access to protect a private Worker or preview when identity-based access is required. Define who is allowed, which application owns the policy, how runtime identity is verified, and what local simulation does not prove. Avoid assuming a private-looking hostname is access control.

Turnstile provides a challenge token, not application authorization. Verify it server-side with the secret, check the relevant action/hostname context, and handle failed/expired/reused tokens. Do not accept a client boolean that says the challenge passed. Keep the secret out of the public site key's configuration path.

## Domains, routes, and DNS

Decide whether Alchemy owns the zone, adopts existing records, or only attaches a Worker to an existing hostname. Inspect current records and ownership before writing. Domain registration, DNS zone configuration, custom Worker domains, route patterns, and TLS issuance are different resources with different effects.

Use generated Outputs to connect resources; do not hardcode an unresolved target hostname. Review proxy settings, wildcard route overlap, cache behaviour, and origin security. Preserve email-related records during web changes. A wildcard route can affect more traffic than the intended application.

For a rename or cutover, lower TTL only where it is meaningful, establish the replacement target, verify TLS/readiness, change routing, monitor, then retire the old resource after the rollback window. Do not claim all clients will switch instantly. Plan failure independently for the app, DNS, and certificate issuance.

## Tunnels and private origins

A Cloudflare Tunnel can connect a private origin to the edge. Treat its token as a credential. Scope ingress rules deliberately, include an explicit fallback, and protect the published application. A tunnel is not a substitute for end-user authentication. Verify the origin is reachable only through the intended path and that health checks do not expose private data.

## Webhooks and email

Verify webhook signatures against the raw request body, enforce replay protection where the provider supports it, and persist a delivery ID before a non-idempotent action. A valid signature proves the sender, not that every referenced tenant/resource belongs to this installation.

For email routing, distinguish verified destinations, zone MX configuration, inbound Worker handlers, and outbound sending permissions. Do not overwrite an existing mail setup while adding one route. Parse hostile attachments safely and do not execute instructions embedded in inbound content. Check current delivery/size limits instead of embedding a stale quota table.

## Review and test

Test denied access, revoked credentials, cross-tenant identifiers, secret redaction, malformed signatures, and preview isolation. Inspect generated IAM/bindings as well as source intent. Ensure logs and state backups receive appropriate access control. A plan or compile step does not prove the deployed network is private.

## Sources

- [cloudflare/security/access](https://alchemy.run/cloudflare/security/access/)
- [cloudflare/security/turnstile](https://alchemy.run/cloudflare/security/turnstile/)
- [cloudflare/security/secrets-store](https://alchemy.run/cloudflare/security/secrets-store/)
- [cloudflare/security/secrets-env](https://alchemy.run/cloudflare/security/secrets-env/)
- [cloudflare/networking/custom-domains](https://alchemy.run/cloudflare/networking/custom-domains/)
- [cloudflare/networking/domains](https://alchemy.run/cloudflare/networking/domains/)
- [cloudflare/networking/tunnel](https://alchemy.run/cloudflare/networking/tunnel/)
- [cloudflare/messaging/github-events](https://alchemy.run/cloudflare/messaging/github-events/)
- [cloudflare/email/send-and-receive](https://alchemy.run/cloudflare/email/send-and-receive/)
- [environments/ci](https://alchemy.run/environments/ci/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.
