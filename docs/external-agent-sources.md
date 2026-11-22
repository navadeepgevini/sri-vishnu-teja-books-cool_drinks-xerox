# External Agent Sources — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. Repository Reviews

| Source Repository | Capability Considered | License | Decision | Reason | Date Reviewed |
|-------------------|----------------------|---------|----------|--------|---------------|
| ECC (affaan-m/ecc) | Agent patterns, project memory, security hygiene, verification discipline | MIT | **Reference Only** | Adapt concepts to existing project; do not overwrite conventions | 2026-11-21 |
| Awesome Agents (kyrolabs/awesome-agents) | Agent framework catalogue, testing tools, research workflows | MIT | **Discovery Only** | Use for discovery; install only if directly supports requirements | 2026-11-21 |
| Agency Agents (msitarzewski/agency-agents) | Specialist agent roles, deliverables, collaboration patterns | MIT | **Reference Only** | Select only useful agents; avoid overlapping responsibilities | 2026-11-21 |
| i-have-adhd (ayghri/i-have-adhd) | Concise communication, action-first patterns, structured checklists | MIT | **Communication Style** | Apply concise reporting format; prefer checklists over long reports | 2026-11-21 |

---

## 2. Adopted Patterns

### 2.1 From ECC
- **Project Memory**: Maintain `docs/project-memory.md` with architecture decisions, completed work, open issues
- **Security Hygiene**: Secret management, Firestore rules as primary auth, no secrets in client bundle
- **Verification Discipline**: Run type checks, build, lint after changes; fix regressions before continuing
- **Agent Roles**: Specialist agents for code review, security, performance, accessibility

### 2.2 From Agency Agents
- **Specialist Agent Definitions**: Code Intelligence, Browser QA, Database, Security, UI Quality, Documentation, Evaluation, Project Memory
- **Collaboration Patterns**: Clear handoffs, structured deliverables, minimal overlap

### 2.3 From i-have-adhd
- **Status Format**: `Done / Verification / Limitations / Next` concise reporting
- **Action-First Communication**: Current task → completed result → blocker → next action

---

## 3. Rejected / Not Adopted

| Repository | Capability | Reason |
|------------|------------|--------|
| ECC | Full agent orchestration framework | Overkill for current project size; existing patterns sufficient |
| Awesome Agents | AutoGPT, BabyAGI, etc. | Autonomous agents not needed; project uses focused specialist patterns |
| Agency Agents | Full agent team with 10+ roles | Project only needs 5-6 core roles; would add complexity |
| i-have-adhd | ADHD-specific tooling | Communication patterns adopted; tooling not needed |

---

## 4. Future Consideration

| Repository | Capability | Trigger for Adoption |
|------------|------------|----------------------|
| ECC | `ecc:orch-*` skills for feature orchestration | When project scales to multiple concurrent features |
| Awesome Agents | Research agent for competitive analysis | When market research needed for new features |
| Agency Agents | DevOps agent for CI/CD automation | When deployment pipeline needs maintenance agent |
| ECC | `ecc:agent-eval` for agent output quality | When agent team expands beyond 3 agents |

---

## 5. Compliance Notes

- All external content treated as untrusted until reviewed
- No external code executed without inspection
- No dependencies added solely based on external repository popularity
- License compatibility verified (all MIT — compatible)
- Documentation updated per bootstrap template requirements

---

*No importers — this is reference documentation for external source review decisions.*