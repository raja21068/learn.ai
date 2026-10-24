# Why did the cascade cost five times more?

_Generated from the LLM Service Lab engine. About 124 seconds at a calm pace._

## Scene 1: title (text, 17.6s)
**On screen:** Why did the cascade cost five times more?

**Narration:** A cascade tries a cheap model first and only calls the big one when needed. It sounds like a sure way to save money. So why did it cost about five times more than simply using the medium model?

## Scene 2: setup (flow, 18.4s)
**On screen:** Request, small model, large model if unsure

**Narration:** Here is the setup. Every one of 40 requests goes to the small model first. If the small model is confident, we stop. If it is unsure, we send the request on to the large model, and we pay for both.

## Scene 3: medium (bars, 14.4s)
**On screen:** Quality: 92.5% and 92.5%

**Narration:** Start with quality. The medium model answers 92.5 percent of the requests correctly. The cascade reaches exactly the same 92.5 percent, so on quality alone it looks like a fair swap.

## Scene 4: cost (bars, 10s)
**On screen:** Cost: $0.0148 against $0.0755

**Narration:** Now the price. The cascade costs $0.0755, about 5.1 times more than the medium model's $0.0148, for the same quality.

## Scene 5: latency (bars, 12.8s)
**On screen:** Latency for 19 of 20 requests: 1,298 against 3,535 milliseconds

**Narration:** It is slower too. With the cascade, 19 out of 20 requests need up to 3,535 milliseconds, against 1,298 for the medium model, about 2.7 times longer.

## Scene 6: why (bars, 19.2s)
**On screen:** 19 of 40 requests paid for both models

**Narration:** The reason is in the logs. 19 of the 40 requests were too hard for the small model, so each of them paid for the small model's attempt and then for the large model as well. Only 21 stopped at the small model.

## Scene 7: trap (bars, 15.6s)
**On screen:** 3 confident wrong answers slipped through

**Narration:** There is a second problem. The small model kept 21 requests. 18 were right, but 3 were wrong, and it was confident, so the cascade had no way to know and never escalated them.

## Scene 8: lesson (flow, 16s)
**On screen:** Right-size first. Cascade only if most requests are easy.

**Narration:** The lesson is to right-size first. A cascade only pays off when the cheap model can handle most of your traffic. Measure your own traffic before you build one, and then try the experiment yourself.
