import type { ActionDescriptor } from "./types";
import { loadModuleConfig, loadEventConfig } from "@/lib/pvz/config-loader";
import type { useEditorStore } from "@/stores/editor-store";

type EditorStore = ReturnType<typeof useEditorStore.getState>;

export async function executeAction(
  action: ActionDescriptor,
  store: EditorStore
): Promise<void> {
  switch (action.type) {
    case "update_level_settings":
      store.updateLevelDef(action.patch);
      break;

    case "add_module": {
      const config = await loadModuleConfig(action.objclass);
      if (!config) {
        console.error(`[AI] 无法加载模块配置: ${action.objclass}`);
        return;
      }
      store.addModule(config);
      break;
    }

    case "remove_module":
      store.removeModule(action.alias);
      break;

    case "update_module":
      store.updateModuleData(action.alias, action.data);
      break;

    case "add_wave":
      for (let i = 0; i < action.count; i++) {
        store.addWave();
      }
      break;

    case "remove_wave":
      store.removeWave(action.index);
      break;

    case "add_event_to_wave": {
      const eventConfig = await loadEventConfig(action.objclass);
      if (!eventConfig) {
        console.error(`[AI] 无法加载事件配置: ${action.objclass}`);
        return;
      }
      store.addEventToWave(action.waveIndex, eventConfig, action.data);
      break;
    }

    case "remove_event_from_wave":
      store.removeEventFromWave(action.waveIndex, action.rtid);
      break;

    case "update_event":
      store.updateEventData(action.alias, action.data);
      break;
  }
}
