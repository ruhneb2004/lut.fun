import { surfClient } from "@/utils/surfClient";
import { MESSAGE_BOARD_ABI } from "@/utils/message_board_abi";

export const getMessageContent = async (): Promise<string> => {
  const content = (await surfClient()
    .useABI(MESSAGE_BOARD_ABI as any)
    .view.get_message_content({
      functionArguments: [],
      typeArguments: [],
    })
    .catch((error) => {
      console.error(error);
      return ["message not exist"];
    })) as string[];

  return content[0];
};
