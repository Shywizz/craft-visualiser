


function itemStackToString(item, meta = 0) {
  return `${item.replace(":", "__")}__${meta}`;
}

function definition(raw){
  if (raw.content.item)
    return itemStackToString(raw.content.item, raw.content.meta);
  else
    return null;
}

function amount(raw){
  switch (raw.type) {
    case "fluidStack":
      return raw.content.amount * 1.0 / 1000.0;
    default:
      return raw.content.amount || 1;
  }
}

function origName(raw) {
  switch (raw.type) {
    case "itemStack":
      return raw.content.item + (raw.content.meta ? ":" + raw.content.meta : "");
    case "fluidStack":
      return `fluid:${raw.content.fluid}`;
    case "placeholder":
      return `placeholder:${raw.content.name}`;
    case "oreDict":
      return `ore:${raw.content.name}`;
    case "empty":
      return `<empty>`;
    default:
      return `TYPE_MISSED`;
  }
}

function itemToString(raw) {
  switch (raw.type) {
    case "itemStack":
      var nbtStr = "";
      if (raw.content.nbt && !$.isEmptyObject(raw.content.nbt)) {
        nbtStr = "__" + JSON.stringify(raw.content.nbt)
          .replace(/\"([^:]+)\":([^{},]+)/g, "$1__$2.?");
      }
      return definition(raw) + nbtStr;
    case "fluidStack":
      return `fluid__${raw.content.fluid}`;
    case "placeholder":
      return `placeholder__${raw.content.name}`;
    case "oreDict":
      return `ore__${raw.content.name}`;
    case "empty":
      return;
    default:
      console.log("Unable to find item type", raw.type);
  }
}

export function parseRawRecipes(unparsedGraph, oreAliases) {

  // ====================================================
  // Organize raw Just Enough Calculation json input
  // ====================================================

  // Try to remove placeholders that created only to extend ingredient count
  var remIndexes = [];
  unparsedGraph.Default.forEach((dd, ii) => {
    var wasRemoved = false;
    dd.output.forEach((obj_output, dd_out_i) => {
      // Special case for placeholder in output:
      // Add its all inputs to recipe where it represent input
      if (obj_output.type === "placeholder") {
        unparsedGraph.Default.forEach(function (d, i) {
          d.output.forEach(output => {
            var pos = d.input.map(e => e.content?.name).indexOf(obj_output.content.name);
            if (pos != -1 && d.input[pos].type === "placeholder") {
              d.input.splice(pos, 1);
              d.input = d.input.concat(dd.input);
              wasRemoved = true;
            }
          });
        });
      }
    });
    if (wasRemoved) {
      remIndexes.push(ii);
    } else {
      dd.input.forEach((obj_input, jj) => {
        // Replace oredict to itemstacks if needed
        if (obj_input.type === "oreDict") {
          var oreAlias = oreAliases[obj_input.content.name];
          if (!oreAlias) console.log(oreAliases, obj_input, obj_input.content.name);

          dd.input[jj] = {
            type: "itemStack",
            content: {
              amount: obj_input.content.amount,
              item: oreAlias.item,
              meta: oreAlias.meta
            }
          };
        }
      });
    }
  });

  // Make indexes unique and remove
  var uniqRemIndexes = [...new Set(remIndexes)];
  for (var i = uniqRemIndexes.length - 1; i >= 0; i--)
    unparsedGraph.Default.splice(uniqRemIndexes[i], 1);

  // ====================================================
  // Create graph and calculate more data
  // ====================================================

  var graph = {
    nodes: [],
    links: []
  };

  // Add node that represents item
  // Return new node or old one if item already present
  function pushNodeFnc(raw) {
    var id = itemToString(raw);
    if (id) {
      var pos = graph.nodes.map(e => e.id).indexOf(id);
      if (pos === -1) {
        // Create new item in nodes
        var node = {
          id: id,
          name: origName(raw),
          definition: definition(raw),
          raw: raw,
          complicity: 1,
          usability: 0,
          outputs: [],
          inputs: [],
          links: []
        };
        graph.nodes.push(node);
        return node;
      } else {
        // Already have item, return it
        return graph.nodes[pos]
      }
    } else {
      // Item have weird .type, "empty" for example
    }
  }

  // Create nodes and links
  unparsedGraph.Default.forEach(function (d, i) {
    d.output.forEach(output => {
      var outNode = pushNodeFnc(output);

      d.input.forEach(input => {
        var idTarget = itemToString(output);
        var idSource = itemToString(input);
        var link;

        if (idTarget && idSource) {
          link = {
            target: idTarget,
            source: idSource,
            weight: 1.0
          };
          graph.links.push(link);
        }
        var inNode = pushNodeFnc(input);
        if (inNode) {
          var weight = amount(input) / amount(output);

          outNode.inputs.push({it: inNode,  weight: weight});
          inNode.outputs.push({it: outNode, weight: weight});

          link.weight = weight;
          inNode.links.push(link);
        }
      });
    });
  });

  // ----------------------------
  // calculate complicity and usability
  // ----------------------------
  function diveIn(node, memberName, deflt, antiLoop = []) {
    var a = (node[memberName].length === 0) ? deflt : (1 - deflt);
    node[memberName].forEach(mem => {
      var check = false;
      antiLoop.forEach(o => check |= (o.id == mem.it.id));
      if (check || mem.it.id == node.id){
        console.log("recipe loop found!", node, memberName, antiLoop);
      } else {
        antiLoop.push(node);
        a += (diveIn(mem.it, memberName, deflt, antiLoop)) * mem.weight;
        antiLoop.pop();
      }
    });
    return a;
  }

  graph.minU = 999999999999;
  graph.maxU = 0;
  graph.minC = 999999999999;
  graph.maxC = 0;
  graph.nodes.forEach(node => {
    node.complicity = diveIn(node, "inputs", 1.0);
    graph.minC = Math.min(graph.minC, node.complicity);
    graph.maxC = Math.max(graph.maxC, node.complicity);

    node.usability = diveIn(node, "outputs", 0.0);
    graph.minU = Math.min(graph.minU, node.usability);
    graph.maxU = Math.max(graph.maxU, node.usability);

    node.links.forEach(link => {
      link.weight += node.complicity;
    });
  });

  console.log("Min Max data:");
  console.log(graph.minC,
    graph.maxC,
    graph.minU,
    graph.maxU);

  // ----------------------------
  // return
  // ----------------------------
  return graph;
}

export function parseCTlog(txt) {
  var rgx = /^Ore entries for <ore:([\w]+)> :\n-<([^:>]+:[^:>]+):?([^:>]+)?/gm;
  var aliasesObj = {};
  for (const match of txt.matchAll(rgx)) {
    var id = itemStackToString(match[2], match[3]);
    aliasesObj[match[1]] = { id: id, item: match[2], meta: match[3] };
  }
  return aliasesObj;
}

export function parseSpritesheet(graph, spritesheetJson) {

  function findSheet(id){
    for (let k of Object.keys(spritesheetJson.frames))
      if (k.match(new RegExp(id + ".*"))) return spritesheetJson.frames[k];
  }

  // Apply View Boxes for all nodes
  graph.nodes.forEach(node => {
    var o = 
      findSheet(node.id)             // Regular icon
      || findSheet(node.definition); // Icon without nbt

    if (!o) {
      if (node.raw.type === "placeholder") {
        node.viewBox = "672 1344 32 32";
      } else if (node.raw.content?.item === "forge:bucketfilled") {
        node.viewBox = "4000 2816 32 32";
      } else {
        console.log("🖼💢:", node.id);
        node.viewBox = "576 3136 32 32";
      }
    } else {
      node.viewBox = o.frame.x + " " + o.frame.y + " 32 32";
    }
  });
}