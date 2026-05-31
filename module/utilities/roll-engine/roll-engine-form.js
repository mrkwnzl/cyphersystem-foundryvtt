import {RollEngineDialogSheet} from "../../forms/roll-engine-dialog-sheet.js";

export async function rollEngineForm(data) {
  // Create rollEngineForm
  let rollEngineForm = foundry.applications.instances.values().find((app) => app instanceof RollEngineDialogSheet) || new RollEngineDialogSheet({data});

  // Render sheet
  rollEngineForm.render(true);
  try {
    rollEngineForm.bringToTop();
  } catch {
    // Do nothing.
  }
}