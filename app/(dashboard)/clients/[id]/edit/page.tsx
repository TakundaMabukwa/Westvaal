import { EditClientWizard } from "@/components/quote-wizard/edit-client-wizard"

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <EditClientWizard clientId={id} />
}
