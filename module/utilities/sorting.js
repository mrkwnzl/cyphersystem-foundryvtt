// Sort items alphabetically
export function byNameAscending(itemA, itemB) {
  let nameA = itemA.name.toLowerCase();
  let nameB = itemB.name.toLowerCase();

  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}

// sort skills by skill rating
export function bySkillRating(itemA, itemB) {
  let ratingA;
  let ratingB;

  if (itemA.system.skillLevel === 'Specialized') {ratingA = 1}
  else if (itemA.system.skillLevel === 'Trained') {ratingA = 2}
  else if (itemA.system.skillLevel === 'Practiced') {ratingA = 3}
  else if (itemA.system.skillLevel === 'Inability') {ratingA = 4}

  if (itemB.system.skillLevel === 'Specialized') {ratingB = 1}
  else if (itemB.system.skillLevel === 'Trained') {ratingB = 2}
  else if (itemB.system.skillLevel === 'Practiced') {ratingB = 3}
  else if (itemB.system.skillLevel === 'Inability') {ratingB = 4}

  if (ratingA < ratingB) {
    return -1;
  }
  if (ratingA > ratingB) {
    return 1;
  }
  return 0;
}

// Sort items by archive status
export function byArchiveStatus(itemA, itemB) {
  let ratingA;
  let ratingB;

  if (!itemA.system.archived) itemA.system.archived = false;
  if (!itemB.system.archived) itemB.system.archived = false;

  if (itemA.system.archived === false) {ratingA = 1}
  else if (itemA.system.archived === true) {ratingA = 2}

  if (itemB.system.archived === false) {ratingB = 1}
  else if (itemB.system.archived === true) {ratingB = 2}

  if (ratingA < ratingB) {
    return -1;
  }
  if (ratingA > ratingB) {
    return 1;
  }
  return 0;
}

// Sort items by indentified status
export function byIdentifiedStatus(itemA, itemB) {
  let ratingA;
  let ratingB;

  if (itemA.system.identified === false) {ratingA = 2}
  else if (itemA.system.identified === true) {ratingA = 1}

  if (itemB.system.identified === false) {ratingB = 2}
  else if (itemB.system.identified === true) {ratingB = 1}

  if (ratingA < ratingB) {
    return -1;
  }
  if (ratingA > ratingB) {
    return 1;
  }
  return 0;
}