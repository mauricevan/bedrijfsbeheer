import React from "react";
import type { QuoteItem, InventoryItem } from "../../../types";
import { ItemRow, type ItemRowProps } from "../../common/forms";

export interface QuoteItemRowProps extends ItemRowProps {
  item: QuoteItem;
}

/**
 * QuoteItemRow component - wrapper around generic ItemRow component
 * This component exists for backward compatibility and type safety
 */
export const QuoteItemRow: React.FC<QuoteItemRowProps> = (props) => {
  return <ItemRow {...props} />;
};

