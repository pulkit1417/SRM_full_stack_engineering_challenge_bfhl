const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const USER_ID = "pulkitgupta_24082005";
const EMAIL_ID = "pg1736@srmist.edu.in";
const COLLEGE_ROLL_NUMBER = "RA23110028030014";

function isValidNode(entry) {
  const trimmed = entry.trim();
  return /^[A-Z]->[A-Z]$/.test(trimmed);
}

function parseEdge(entry) {
  const trimmed = entry.trim();
  const parts = trimmed.split("->");
  return { from: parts[0], to: parts[1] };
}

function buildHierarchies(validEdges) {
  const childSet = new Set();
  const adjacency = {};
  const nodeSet = new Set();

  for (const edge of validEdges) {
    const { from, to } = edge;
    nodeSet.add(from);
    nodeSet.add(to);
    if (!adjacency[from]) adjacency[from] = [];
    adjacency[from].push(to);
    childSet.add(to);
  }

  const roots = [];
  for (const node of nodeSet) {
    if (!childSet.has(node)) roots.push(node);
  }
  roots.sort();

  function findCycle(startNode, adj) {
    const visited = new Set();
    const stack = new Set();
    function dfs(node) {
      visited.add(node);
      stack.add(node);
      for (const child of (adj[node] || [])) {
        if (!visited.has(child)) {
          if (dfs(child)) return true;
        } else if (stack.has(child)) {
          return true;
        }
      }
      stack.delete(node);
      return false;
    }
    return dfs(startNode);
  }

  function getGroupNodes(root, adj) {
    const visited = new Set();
    const queue = [root];
    visited.add(root);
    while (queue.length > 0) {
      const current = queue.shift();
      for (const child of (adj[current] || [])) {
        if (!visited.has(child)) {
          visited.add(child);
          queue.push(child);
        }
      }
    }
    return visited;
  }

  function buildTree(node, adj, visited) {
    const children = adj[node] || [];
    const treeNode = {};
    for (const child of children) {
      if (!visited.has(child)) {
        visited.add(child);
        treeNode[child] = buildTree(child, adj, visited);
      }
    }
    return treeNode;
  }

  function getDepth(node, adj) {
    const children = adj[node] || [];
    if (children.length === 0) return 1;
    let max = 0;
    for (const child of children) {
      const d = getDepth(child, adj);
      if (d > max) max = d;
    }
    return 1 + max;
  }

  const hierarchies = [];

  for (const root of roots) {
    const hasCycle = findCycle(root, adjacency);
    if (hasCycle) {
      const groupNodes = getGroupNodes(root, adjacency);
      hierarchies.push({ root, tree: {}, has_cycle: true, _nodes: groupNodes });
    } else {
      const visited = new Set([root]);
      const tree = buildTree(root, adjacency, visited);
      const depth = getDepth(root, adjacency);
      hierarchies.push({ root, tree: { [root]: tree }, depth, _nodes: visited });
    }
  }

  const allPureNodes = new Set();
  for (const h of hierarchies) {
    for (const n of h._nodes) allPureNodes.add(n);
  }

  const orphaned = new Set();
  for (const node of nodeSet) {
    if (!allPureNodes.has(node)) orphaned.add(node);
  }

  if (orphaned.size > 0) {
    const orphanRoot = [...orphaned].sort()[0];
    hierarchies.push({ root: orphanRoot, tree: {}, has_cycle: true, _nodes: orphaned });
  }

  for (const h of hierarchies) delete h._nodes;

  return hierarchies;
}

function computeSummary(hierarchies) {
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = null;
  let largestDepth = -1;

  for (const h of hierarchies) {
    if (h.has_cycle) {
      totalCycles++;
    } else {
      totalTrees++;
      const depth = h.depth || 1;
      if (depth > largestDepth || (depth === largestDepth && largestTreeRoot !== null && h.root < largestTreeRoot)) {
        largestDepth = depth;
        largestTreeRoot = h.root;
      }
    }
  }

  return { total_trees: totalTrees, total_cycles: totalCycles, largest_tree_root: largestTreeRoot };
}

app.get("/bfhl", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SRM BFHL API is live. Use POST /bfhl with { data: [...] } to process node strings.",
    endpoint: "POST /bfhl",
    content_type: "application/json",
    example_body: { data: ["A->B", "A->C", "B->D"] }
  });
});

app.post("/bfhl", (req, res) => {
  const body = req.body;

  if (!body || !Array.isArray(body.data)) {
    return res.status(400).json({ error: "Invalid request body. 'data' array is required." });
  }

  const rawData = body.data;
  const invalidEntries = [];
  const duplicateEdges = [];
  const validEdgeStrings = new Set();
  const validEdges = [];

  for (const item of rawData) {
    if (typeof item !== "string") {
      invalidEntries.push(String(item));
      continue;
    }
    const trimmed = item.trim();
    if (!isValidNode(trimmed)) {
      invalidEntries.push(item);
      continue;
    }
    if (validEdgeStrings.has(trimmed)) {
      if (!duplicateEdges.includes(trimmed)) duplicateEdges.push(trimmed);
    } else {
      validEdgeStrings.add(trimmed);
      validEdges.push(parseEdge(trimmed));
    }
  }

  const parentMap = {};
  const filteredEdges = [];

  for (const edge of validEdges) {
    const { from, to } = edge;
    if (from === to) continue;
    if (parentMap[to] !== undefined) continue;
    parentMap[to] = from;
    filteredEdges.push(edge);
  }

  const hierarchies = buildHierarchies(filteredEdges);
  const summary = computeSummary(hierarchies);

  const resolvedUserId = (body.user_id && String(body.user_id).trim()) || USER_ID;
  const resolvedEmail  = (body.email_id && String(body.email_id).trim()) || EMAIL_ID;
  const resolvedRoll   = (body.college_roll_number && String(body.college_roll_number).trim()) || COLLEGE_ROLL_NUMBER;

  return res.status(200).json({
    user_id: resolvedUserId,
    email_id: resolvedEmail,
    college_roll_number: resolvedRoll,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary
  });
});

app.listen(PORT, () => {
  console.log(`BFHL API running on port ${PORT}`);
});
