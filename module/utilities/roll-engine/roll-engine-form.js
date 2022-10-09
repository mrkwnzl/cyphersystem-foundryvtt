import {RollEngineDialogSheet} from "../../forms/roll-engine-dialog-sheet.js";

export async function rollEngineForm(data) {
  // Create rollEngineForm
  let rollEngineForm = Object.values(ui.windows).find((app) => app instanceof RollEngineDialogSheet) || new RollEngineDialogSheet(data);

  // Render sheet
  rollEngineForm.render(true);
  try {
    rollEngineForm.bringToTop();
  } catch {
    // Do nothing.
  }
}