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

  if (itemA.data.skillLevel === 'Specialized') { ratingA = 1 }
  else if (itemA.data.skillLevel === 'Trained') { ratingA = 2 }
  else if (itemA.data.skillLevel === 'Practiced') { ratingA = 3 }
  else if (itemA.data.skillLevel === 'Inability') { ratingA = 4 }

  if (itemB.data.skillLevel === 'Specialized') { ratingB = 1 }
  else if (itemB.data.skillLevel === 'Trained') { ratingB = 2 }
  else if (itemB.data.skillLevel === 'Practiced') { ratingB = 3 }
  else if (itemB.data.skillLevel === 'Inability') { ratingB = 4 }

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

  if (!itemA.data.archived) itemA.data.archived = false;
  if (!itemB.data.archived) itemB.data.archived = false;

  if (itemA.data.archived === false) { ratingA = 1 }
  else if (itemA.data.archived === true) { ratingA = 2 }

  if (itemB.data.archived === false) { ratingB = 1 }
  else if (itemB.data.archived === true) { ratingB = 2 }

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

  if (itemA.data.identified === false) { ratingA = 2 }
  else if (itemA.data.identified === true) { ratingA = 1 }

  if (itemB.data.identified === false) { ratingB = 2 }
  else if (itemB.data.identified === true) { ratingB = 1 }

  if (ratingA < ratingB) {
    return -1;
  }
  if (ratingA > ratingB) {
    return 1;
  }
  return 0;
}