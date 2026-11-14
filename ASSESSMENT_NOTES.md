# Assessment reflection — draft

These are draft examples to help prepare assessment responses. **Verify and personalize every statement so it accurately describes the final implementation and your own decisions before submission.**

## A. Three technical decisions

### 1. Technology and architecture

I used React with Vite for a quick, responsive client and kept the Express/Mongoose API in a separate workspace. This preserves the requested MERN stack while making frontend and backend responsibilities straightforward to install, run, and deploy independently. The trade-off is maintaining two runtime environments and coordinating their origins/API URL through configuration.

### 2. REST API and data model

Tasks use a small Mongoose schema with explicit title/description bounds, enum values, defaults, and timestamps. REST endpoints support partial updates and server-side filtering, sorting, and pagination. A field allow-list and validated query parsing prevent unintended MongoDB writes. Pagination is capped at 100 to keep requests bounded. The trade-off is extra controller/query logic compared with returning every task, while the current interface only displays the first page.

### 3. UI/UX, validation, and error handling

The dashboard separates task statistics, filtering, and task actions into reusable components and pairs visual feedback with accessible labels, loading/error/empty states, and inline form validation. Input is checked in the browser for immediate feedback and again by the API as the trusted boundary. The trade-off is that the responsive dashboard uses custom CSS rather than a component library, which keeps dependencies lean but means more styling must be maintained in the project.

## B. Features deliberately out of scope

These items were not implemented in this assessment build. Re-check the final code before using these draft statements.

### 1. Authentication and multi-user support

Authentication and per-user task ownership were left out to focus the assessment on the requested CRUD and task workflow. Adding identity safely requires an authentication strategy, authorization checks on every task query, session/token lifecycle decisions, and security testing; a superficial login would falsely imply data isolation. As delivered, the API is single-workspace and should not be exposed with private data.

### 2. Email notifications and reminders

Email notifications and reminders were left out because they need delivery-provider configuration, background scheduling, retry handling, and user notification preferences beyond the core task manager. The current application records and displays due dates but does not send messages.

### 3. Team collaboration and recurring tasks

Shared task ownership, comments/assignment, and recurring schedules were left out to keep the data model and user experience centered on individual task CRUD. These features introduce collaboration permissions and recurrence/timezone edge cases that deserve a separate design and test pass rather than a partial implementation.

## C. Current limitation and one-day improvement

**Limitation:** The API supports pagination, but the dashboard only requests and displays the first 50 matching tasks; it does not offer controls to visit later pages. This is a real usability limitation for larger workspaces.

**One additional day:** Add accessible previous/next page controls and a page indicator to the toolbar/list, keep the selected filters and sort in the request state, reset to page one when those parameters change, and add a focused client/API integration check for paging and result totals.
