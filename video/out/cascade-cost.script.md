# Why did the cascade cost five times more?

_Generated from the LLM Service Lab engine. About 112 seconds at a calm pace._

## Scene 1: title (text, 17.6s)
**On screen:** Why did the cascade cost five times more?

**Narration:** A cascade tries a cheap model first and only calls the big one when needed. It sounds like a sure way to save money. So why did it cost about five times more than simply using the medium model?

## Scene 2: setup (flow, 18.4s)
**On screen:** Request, small model, large model if unsure

**Narration:** Here is the setup. Every one of 40 requests goes to the small model first. If the small model is confident, we stop. If it is unsure, we send the request on to the large model, and we pay for both.

## Scene 3: medium (text, 14.4s)
**On screen:** Medium model alone: 92.5% correct, $0.0148

**Narration:** Start with the medium model on its own. It answers 92.5 percent of the requests correctly, for a total of $0.0148, and 19 out of 20 requests finish within 1,298 milliseconds.

## Scene 4: cascade (text, 15.6s)
**On screen:** Cascade: 92.5% correct, $0.0755

**Narration:** Now the cascade. Its quality is the same, 92.5 percent. But the cost is $0.0755, about 5.1 times more, and 19 out of 20 requests need up to 3,535 milliseconds, about 2.7 times longer.

## Scene 5: why (text, 16.4s)
**On screen:** 19 of 40 requests paid for both models

**Narration:** The reason is in the logs. 19 of the 40 requests were too hard for the small model, so each of them paid for the small model's attempt and then for the large model as well.

## Scene 6: trap (text, 14s)
**On screen:** 3 confident wrong answers slipped through

**Narration:** There is a second problem. 3 requests were answered wrongly by the small model, and it was confident, so the cascade had no way to know and never escalated them.

## Scene 7: lesson (text, 16s)
**On screen:** Right-size first. Cascade only if most requests are easy.

**Narration:** The lesson is to right-size first. A cascade only pays off when the cheap model can handle most of your traffic. Measure your own traffic before you build one, and then try the experiment yourself.
