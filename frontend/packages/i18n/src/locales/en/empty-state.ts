/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export default {
  common_empty_state: {
    progress: {
      title: "There're no progress metrics to show yet.",
      description: "Start setting property values in tasks to see progress metrics here.",
    },
    updates: {
      title: "No updates yet.",
      description: "Once department members add updates it will appear here",
    },
    search: {
      title: "No matching results.",
      description: "No results found. Try adjusting your search terms.",
    },
    not_found: {
      title: "Oops! Something seems wrong",
      description: "We are unable to fetch your plane account currently. This might be a network error.",
      cta_primary: "Try reloading",
    },
    server_error: {
      title: "Server error",
      description: "We are unable to connect and fetch data from our server. Don't worry, we are working on it.",
      cta_primary: "Try reloading",
    },
  },
  project_empty_state: {
    no_access: {
      title: "Seems like you don’t have access to this Department",
      restricted_description: "Contact admin to request for access and you can continue here.",
      join_description: "Click the button below to join it.",
      cta_primary: "Join department",
      cta_loading: "Joining department",
    },
    invalid_project: {
      title: "Department not found",
      description: "The department you are looking for does not exist.",
    },
    work_items: {
      title: "Start with your first task.",
      description:
        "Tasks are the building blocks of your department — assign owners, set priorities, and track progress easily.",
      cta_primary: "Create your first task",
    },
    cycles: {
      title: "Group and timebox your work in Cycles.",
      description:
        "Break work down by timeboxed chunks, work backwards from your department deadline to set dates, and make tangible progress as a team.",
      cta_primary: "Set your first cycle",
    },
    cycle_work_items: {
      title: "No tasks to show in this cycle",
      description:
        "Create tasks to begin monitoring your team's progress this cycle and achieve your goals on time.",
      cta_primary: "Create task",
      cta_secondary: "Add existing task",
    },
    modules: {
      title: "Map your department goals to Modules and track easily.",
      description:
        "Modules are made up of interconnected tasks. They assist in monitoring progress through department phases, each with specific deadlines and analytics to indicate how close you are to achieving those phases.",
      cta_primary: "Set your first module",
    },
    module_work_items: {
      title: "No tasks to show in this Module",
      description: "Create tasks to begin monitoring this module.",
      cta_primary: "Create task",
      cta_secondary: "Add existing task",
    },
    views: {
      title: "Save custom views for your department",
      description:
        "Views are saved filters that help you quickly access the information you use most. Collaborate effortlessly as teammates share and tailor views to their specific needs.",
      cta_primary: "Create view",
    },
    no_work_items_in_project: {
      title: "No tasks in the department yet",
      description: "Add tasks to your department and slice your work into trackable pieces with views.",
      cta_primary: "Add task",
    },
    work_item_filter: {
      title: "No tasks found",
      description: "Your current filter didn't return any results. Try changing the filters.",
      cta_primary: "Add task",
    },
    pages: {
      title: "Document everything — from notes to PRDs",
      description:
        "Pages let you capture and organize information in one place. Write meeting notes, department documentation, and PRDs, embed tasks, and structure them with ready-to-use components.",
      cta_primary: "Create your first Page",
    },
    archive_pages: {
      title: "No archived pages yet",
      description: "Archive pages not on your radar. Access them here when needed.",
    },
    intake_sidebar: {
      title: "Log Intake requests",
      description: "Submit new requests to be reviewed, prioritized, and tracked within your department's workflow.",
      cta_primary: "Create Intake request",
    },
    intake_main: {
      title: "Select an Intake task to view its details",
    },
  },
  workspace_empty_state: {
    archive_work_items: {
      title: "No archived tasks yet",
      description:
        "Manually or through automation, you can archive tasks that are completed or cancelled. Find them here once archived.",
      cta_primary: "Set automation",
    },
    archive_cycles: {
      title: "No archived cycles yet",
      description: "To tidy up your department, archive completed cycles. Find them here once archived.",
    },
    archive_modules: {
      title: "No archived Modules yet",
      description: "To tidy up your department, archive completed or cancelled modules. Find them here once archived.",
    },
    home_widget_quick_links: {
      title: "Keep important references, resources, or docs handy for your work",
    },
    inbox_sidebar_all: {
      title: "Updates for your subscribed tasks will appear here",
    },
    inbox_sidebar_mentions: {
      title: "Mentions for your tasks will appear here",
    },
    your_work_by_priority: {
      title: "No task assigned yet",
    },
    your_work_by_state: {
      title: "No task assigned yet",
    },
    views: {
      title: "No Views yet",
      description: "Add tasks to your department and use views to filter, sort, and monitor progress effortlessly.",
      cta_primary: "Add task",
    },
    drafts: {
      title: "Half-written tasks",
      description:
        "To try this out, start adding a task and leave it mid-way or create your first draft below. 😉",
      cta_primary: "Create draft task",
    },
    projects_archived: {
      title: "No departments archived",
      description: "Looks like all your departments are still active—great job!",
    },
    analytics_projects: {
      title: "Create departments to visualize department metrics here.",
    },
    analytics_work_items: {
      title:
        "Create departments with tasks and assignees to start tracking performance, progress, and team impact here.",
    },
    analytics_no_cycle: {
      title: "Create cycles to organise work into time-bound phases and track progress across sprints.",
    },
    analytics_no_module: {
      title: "Create modules to organize your work and track progress across different stages.",
    },
    analytics_no_intake: {
      title: "Set up intake to manage incoming requests and track how they're accepted and rejected",
    },
  },
  settings_empty_state: {
    estimates: {
      title: "No estimates yet",
      description: "Define how your team measures effort and track it consistently across all tasks.",
      cta_primary: "Add estimate system",
    },
    labels: {
      title: "No labels yet",
      description: "Create personalized labels to effectively categorize and manage your tasks.",
      cta_primary: "Create your first label",
    },
    exports: {
      title: "No exports yet",
      description: "You don't have any export records right now. Once you export data, all records will appear here.",
    },
    tokens: {
      title: "No Personal token yet",
      description: "Generate secure API tokens to connect your organization with external systems and applications.",
      cta_primary: "Add API token",
    },
    webhooks: {
      title: "No Webhook added yet",
      description: "Automate notifications to external services when department events occur.",
      cta_primary: "Add webhook",
    },
  },
} as const;
