# Replace Sector Sprint altitude control with progressive lanes

Sector Sprint keeps its fixed five authored Acts and one-contact Action stakes, but removes continuous altitude control. The Action route now uses three discrete travel lanes. A fresh Up or Down key press or button tap requests one adjacent move; held input and keyboard repeat do nothing, and at most one fresh request can wait while a move settles. Failure, pause, blur, visibility loss, pointer cancellation, orientation change, route changes, and Act changes discard any waiting request.

The route begins in the middle lane. Every first gate is safe in that lane, and every later safe lane is at most one move from the previous safe lane. Gate count rises from five to nine across the Acts. Warnings begin 1.8, 1.6, 1.4, 1.15, and 0.95 seconds before contact respectively, using position, arrow shape, and text rather than color alone. Eased lane movement is simulation-owned and lasts 260, 240, 220, 200, and 180 milliseconds. Rendering and swept collision read the same moving collision hull.

Automatic forward speed rises continuously within and across the five Acts: 94→104, 104→116, 116→130, 130→146, and 146→164 logical pixels per second. Gate positions are derived from authored contact times through the exact speed integral, so acceleration changes visual pressure without changing any 32-second Act duration, order, or curtain outcome. Every Act leaves at least three seconds between its last gate and curtain.

Only a lit architectural face ends the Action attempt. The road and upper scene edge are presentation, not collision boundaries. Comic targets, fixed Act tools, temporary flourishes, people, animals, vehicles, and buildings remain harmless and irrelevant to completion. A contact creates one neutral in-memory failure state and no score, health, lives, checkpoint, visible timer, failure history, randomized reward, persistent inventory, or Gallery completion.

Recovery remains inside the same foreground-only 240-second table boundary. Retry appears only when the complete five-Act route, five full two-second catch-up allowances, and all Act transitions still fit. The boundary outranks lane input, collision, recovery, transition, and completion in the same frame. Narrated and Salon choices remain available, and reduced motion begins directly in the complete narrated route.

The existing sandstone, timber, brass, terrazzo, and phulkari material treatments remain. Rider motion changes from continuous vertical correction to anticipation, lean, eased travel, fabric and bag lag, and settlement. The illustrated and code-drawn fallbacks share the same movement state.

## Evidence boundary

Automated checks may establish deterministic solvability, four-to-eight required lane inputs per Act, timing tolerance, continuous speed growth, one-contact behavior, technical responsiveness, privacy, and bounded recovery. They cannot establish universally balanced difficulty, similarity to another commercial game, biomechanical realism, or representative adult enjoyment without declared human play evidence.
