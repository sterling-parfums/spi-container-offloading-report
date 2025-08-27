import z from "zod";

export const submitReportSchema = z.object({
  containerNumber: z.string(),
  sealNumber: z.string(),
  fsaNumber: z.string(),
  numOfContainers: z.coerce.number().min(1),
  receivedDate: z.iso.date(),
  offloadedDate: z.iso.date(),
  returnDate: z.iso.date(),
  warehouse: z.enum(["API"]),
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
