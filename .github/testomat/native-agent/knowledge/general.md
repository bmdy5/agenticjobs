---
url: '*'
title: ''
---
PRODUCT REQUIREMENT: The username input must preserve exactly 20 typed characters and truncate the 21st character. This input length requirement is independent of authentication. Only demo / DemoPass123! is a valid login account. An arbitrary 20-character username must NOT be expected to log in. Verify the typed input value against the 20-character requirement, not against the current HTML maxlength. Do not assume the current implementation is correct.

---

For username length boundary tests use literal abcdefghijklmnopqrst (exactly 20 ASCII letters), never a session name or random value. For 21 use abcdefghijklmnopqrstu. These exact required test fixtures are not login attempts. Verify actual DOM input value or length, never count screenshot text or interpret visual clipping as stored truncation. Expected after either fixture is exactly abcdefghijklmnopqrst, length 20. Do not submit form.
