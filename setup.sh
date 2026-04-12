#!/bin/bash
# ============================================
# AI-CEO Framework -- Quick Setup
# Run this script in your project root directory
# ============================================

set -e

echo "============================================"
echo "  AI-CEO Framework Setup"
echo "  Run Your Entire Company with Claude Code"
echo "============================================"
echo ""

# Collect information
read -p "Company name: " COMPANY_NAME
read -p "CEO name: " CEO_NAME
read -p "Monthly AI budget (USD, e.g., 200): " MONTHLY_AI_BUDGET
read -p "Auto-approve limit per item (USD, e.g., 50): " AUTO_APPROVE_LIMIT
read -p "Accounting software (e.g., QuickBooks, Xero, FreshBooks): " ACCOUNTING_SOFTWARE
read -p "Marketing tool (e.g., HubSpot, Mailchimp, Buffer): " MARKETING_TOOL
read -p "Analytics tool (e.g., Google Analytics, Plausible, Umami): " ANALYTICS_TOOL
read -p "Blog content path (e.g., ./content/blog): " BLOG_CONTENT_PATH
read -p "Book source path (e.g., ./content/books): " BOOK_SOURCE_PATH
read -p "Publishing platform (e.g., Amazon KDP, Gumroad, Leanpub): " PUBLISHING_PLATFORM
read -p "Target audience (e.g., developers, small business owners): " TARGET_AUDIENCE
read -p "Number of departments (default: 11): " DEPARTMENT_COUNT
DEPARTMENT_COUNT=${DEPARTMENT_COUNT:-11}
read -p "Consulting target industries (comma-separated, e.g., education,logistics): " CONSULTING_INDUSTRIES

CEO_APPROVAL_LIMIT=$AUTO_APPROVE_LIMIT

echo ""
echo "Setting up framework..."
echo ""

# Create directory structure
mkdir -p .claude/agents
mkdir -p .claude/skills
mkdir -p .company/steering
mkdir -p .company/products
mkdir -p .company/departments/dev
mkdir -p .company/departments/marketing
mkdir -p .company/departments/sales
mkdir -p .company/departments/finance
mkdir -p .company/departments/cs
mkdir -p .company/departments/legal
mkdir -p .company/departments/hr
mkdir -p .company/departments/publishing
mkdir -p .company/departments/consulting
mkdir -p .company/decisions

echo "  [OK] Directory structure created"

# Get the directory where the setup script lives (source files)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Copy CLAUDE.md to project root
cp "$SCRIPT_DIR/CLAUDE.md" ./CLAUDE.md

# Copy agents
cp "$SCRIPT_DIR/agents/"*.md .claude/agents/

# Copy skills
cp "$SCRIPT_DIR/skills/"*.md .claude/skills/

# Copy steering files
cp "$SCRIPT_DIR/steering/"*.md .company/steering/

echo "  [OK] Framework files copied"

# Replace placeholders in all files
replace_placeholder() {
  local placeholder="$1"
  local value="$2"
  # Use different sed syntax for macOS vs Linux
  if [[ "$OSTYPE" == "darwin"* ]]; then
    find . -name "*.md" -not -path "./.git/*" -exec sed -i '' "s|{{${placeholder}}}|${value}|g" {} +
  else
    find . -name "*.md" -not -path "./.git/*" -exec sed -i "s|{{${placeholder}}}|${value}|g" {} +
  fi
}

replace_placeholder "COMPANY_NAME" "$COMPANY_NAME"
replace_placeholder "CEO_NAME" "$CEO_NAME"
replace_placeholder "MONTHLY_AI_BUDGET" "$MONTHLY_AI_BUDGET"
replace_placeholder "AUTO_APPROVE_LIMIT" "$AUTO_APPROVE_LIMIT"
replace_placeholder "CEO_APPROVAL_LIMIT" "$CEO_APPROVAL_LIMIT"
replace_placeholder "ACCOUNTING_SOFTWARE" "$ACCOUNTING_SOFTWARE"
replace_placeholder "MARKETING_TOOL" "$MARKETING_TOOL"
replace_placeholder "ANALYTICS_TOOL" "$ANALYTICS_TOOL"
replace_placeholder "BLOG_CONTENT_PATH" "$BLOG_CONTENT_PATH"
replace_placeholder "BOOK_SOURCE_PATH" "$BOOK_SOURCE_PATH"
replace_placeholder "PUBLISHING_PLATFORM" "$PUBLISHING_PLATFORM"
replace_placeholder "TARGET_AUDIENCE" "$TARGET_AUDIENCE"
replace_placeholder "DEPARTMENT_COUNT" "$DEPARTMENT_COUNT"
replace_placeholder "CONSULTING_INDUSTRIES" "$CONSULTING_INDUSTRIES"

echo "  [OK] Placeholders replaced with your values"

# Generate initial approval queue
cat > .company/approval-queue.md << 'QUEUE_EOF'
# Approval Queue

## Pending (0 items)
_No pending items_

## Recent Approvals/Rejections
_No history yet_
QUEUE_EOF

# Generate initial decision log
CURRENT_MONTH=$(date +"%Y-%m")
CURRENT_DATE=$(date +"%Y-%m-%d")
cat > ".company/decisions/${CURRENT_MONTH}.md" << DECISION_EOF
# CEO Decision Log -- $(date +"%B %Y")

## ${CURRENT_DATE}: AI-CEO Framework Initial Setup
- **Decision:** Adopt AI-CEO Framework for company operations
- **Rationale:** Automate business operations with AI agents
- **Scope:** All departments
DECISION_EOF

echo "  [OK] Initial files generated"

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Open Claude Code in this directory"
echo "  2. Run: /ai-ceo:init"
echo "     This will interview you and generate"
echo "     VISION.md, STATE.md, ROADMAP.md, and"
echo "     all department/product state files."
echo ""
echo "  3. Then try: /ai-ceo:morning"
echo "     to see your first daily briefing."
echo ""
echo "  Or just talk naturally:"
echo '     "What'"'"'s our status?"'
echo '     "Write a blog post about AI automation"'
echo '     "Run a dev sprint"'
echo ""
echo "Enjoy your AI-powered company!"
