import warehouseEmails from "@/config/warehouse-emails";
import z from "zod";

export const submitReportSchema = z.object({
  containerNumber: z.string(),
  sealNumber: z.string(),
  fsaNumber: z.string(),
  numOfContainers: z.coerce.number().min(1),
  receivedDate: z.iso.datetime(),
  offloadedDate: z.iso.datetime(),
  returnDate: z.iso.datetime(),
  warehouse: z.enum(
    Object.keys(warehouseEmails) as (keyof typeof warehouseEmails)[],
  ),
  items: z
    .array(
      z
        .object({
          name: z.string(),
          uom: z.string(),
          cartonsPerPallet: z.number().min(1),
          quantityPerCarton: z.number().min(1),
        })
        .transform((item) => ({
          ...item,
          totalQuantity: item.cartonsPerPallet * item.quantityPerCarton,
        })),
    )
    .min(1, "At least one item is required"),
});

export type SubmitReportInput = z.infer<typeof submitReportSchema>;
