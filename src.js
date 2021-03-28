/**
 * Basic array sum
 * @param {number[]} arrayOfNumbers 
 * @returns 
 */
const sumArray = (arrayOfNumbers) => arrayOfNumbers.reduce((sum, newVal) => sum + newVal, 0);

/**
 * 
 * @param {number[]} values array of values 
 * @param {number} numGroups number of possible groups
 * @param {number[]} picks array which points each value to a group
 * @returns {number[][]} groups, each with the assigned values
 */
const getValuesByGroupFromPicks = (values, numGroups, picks) => {
  // this is rather slow, and this intermediate step could be partially be optimized away
  const groups = Array.from({ length: numGroups }, () => []);
  values.forEach((value, index) => {
    groups[picks[index]].push(value);
  });
  return groups;
}

/**
 * For a given solution, find the "cost" of that e.g. how unequal it is
 * @param {number[]} values array of values 
 * @param {number} numGroups number of possible groups
 * @param {number[]} picks array which points each value to a group
 * @returns 
 */
const calculateSolutionCost = (values, numGroups, picks) => {
  const groups = getValuesByGroupFromPicks(values, numGroups, picks);
  const groupTotals = groups.map(groupValues => {
    return sumArray(groupValues);
  });
  // average will be the same across all rounds, so could be pulled out
  const average = sumArray(groupTotals) / numGroups;

  // not sure using ^2 really matters for this scenario
  const groupCost = groupTotals.map(groupTotal => Math.pow(Math.abs(groupTotal - average), 2));
  const solutionCost = sumArray(groupCost);
  return solutionCost;
}

/**
 * Given a list of values, split them into multiple groups such that the groups
 * are most equal in value
 * @param {number[]} values list of numbers we'll split up into groups
 * @param {number} numGroups number of groups we'll split into
 */
const splitToGroups = (values, numGroups) => {

  // we're computing all permutations, which includes a lot of duplicate picks, 
  // since we don't care about the ordering of the groups
  const recursiveHandler = (currentPicks, picksLeft, onCombinationCompletion) => {
    if (!currentPicks.length) {
      // small optimization, first pick can always go in first group since group ordering
      // doesn't matter. 
      recursiveHandler([0], picksLeft - 1, onCombinationCompletion);
    } if (picksLeft > 0) {
      for (var i = 0; i < numGroups; i++) {
        const newPicks = [...currentPicks, i];
        recursiveHandler(newPicks, picksLeft - 1, onCombinationCompletion);
      }
    } else {
      onCombinationCompletion(currentPicks);
    }
  }

  let bestSolution = [];
  let bestSolutionCost = Infinity;
  let iterations = 0;
  recursiveHandler([], values.length, (pick) => {
    iterations += 1;
    const cost = calculateSolutionCost(values, numGroups, pick);
    if (cost < bestSolutionCost) {
      // console.log('Found new best pick: ', cost, pick);
      bestSolutionCost = cost;
      bestSolution = pick;
    }
  })

  console.log(`iterations: ${iterations}`);

  console.log(`best solution: `, bestSolution, bestSolutionCost);
  const groups = Array.from({ length: numGroups }, () => []);
  values.forEach((value, index) => {
    groups[bestSolution[index]].push(value);
  })
  const groupTotals = groups.map(groupValues => sumArray(groupValues));
  console.log(groupTotals);

  groups.forEach((group, groupIndex) => {
    console.log(`Group ${groupIndex}:`)
    console.log(`  Values: ${group.join(', ')}`)
    console.log(`    Total: ${groupTotals[groupIndex]}`)
  });

  return {
    groups,
    groupTotals,
    iterations
  }
}


const stringifyResult = (result) => {
  let string = `Total iterations: ${result.iterations}

${result.groups.map((group, groupIndex) => {
    return `Group ${groupIndex}:\n  Values: ${group.join(', ')}\n    Total: ${result.groupTotals[groupIndex]}`;
  }).join('\n\n')}
  `;
  return string;
}

