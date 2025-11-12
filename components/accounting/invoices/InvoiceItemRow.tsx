import React from "react";
import type { QuoteItem } from "../../../types";
import { ItemRow, type ItemRowProps } from "../../common/forms";

export interface InvoiceItemRowProps extends ItemRowProps {
  item: QuoteItem;
}

/**
 * InvoiceItemRow component - wrapper around generic ItemRow component
 * This component exists for backward compatibility and type safety
 */
export const InvoiceItemRow: React.FC<InvoiceItemRowProps> = (props) => {
  return <ItemRow {...props} />;
};

