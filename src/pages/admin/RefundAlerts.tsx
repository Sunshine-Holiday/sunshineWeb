import { useState } from "react";
import { toast } from "react-toastify";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefundAlert, useRefundAlertsQuery, useResolveRefundAlertMutation, useReconcilePaymentsMutation } from "@/store/api/adminCommunication";
function AlertCard({
  alert
}: {
  alert: RefundAlert;
}) {
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [resolve, {
    isLoading
  }] = useResolveRefundAlertMutation();
  const finish = async () => {
    try {
      await resolve({
        id: alert._id,
        refundReference: reference,
        adminNote: note
      }).unwrap();
      toast.success("Refund marked completed");
    } catch (e: any) {
      toast.error(e?.data?.message || "Unable to update refund alert");
    }
  };
  const booking = alert.bookingData;
  return <article className="space-y-4 rounded-xl border border-orange-200 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{booking.passengers[0]?.name || "Customer"}</h2><p className="text-sm text-slate-500">Payment received {new Date(alert.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">{alert.status === "resolved" ? "Resolved" : "Refund required"}</span></div>
    <p className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800">{alert.reason}</p>
    <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Payment received</dt><dd className="font-semibold">₹{(alert.amount / 100).toLocaleString("en-IN")}</dd></div><div><dt className="text-slate-500">Total booking value</dt><dd>₹{booking.price.toLocaleString("en-IN")}</dd></div><div><dt className="text-slate-500">Trip</dt><dd className="break-all">{booking.tripTitle || booking.trip}</dd></div><div><dt className="text-slate-500">Trip date</dt><dd>{booking.selectedDate}</dd></div><div><dt className="text-slate-500">Razorpay order</dt><dd className="break-all">{alert.orderId}</dd></div><div><dt className="text-slate-500">Razorpay payment</dt><dd className="break-all">{alert.paymentId}</dd></div></dl>
    <div><h3 className="mb-1 text-sm font-semibold">Selected seats</h3><p className="text-sm">{booking.selectedSeats.map(s => `${s.leg === "single" ? "" : `${s.leg} · `}Bus ${s.busIndex + 1}, seat ${s.seat}`).join("; ")}</p></div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">Passenger</th><th className="p-2">Phone</th><th className="p-2">Email</th><th className="p-2">Drop location</th></tr></thead><tbody>{booking.passengers.map((p, i) => <tr key={i} className="border-b"><td className="p-2">{p.name}</td><td className="p-2">{p.phoneNumber}</td><td className="p-2">{p.email}</td><td className="p-2">{p.dropLocation || "—"}</td></tr>)}</tbody></table></div>
    <details className="text-sm"><summary className="cursor-pointer font-medium">Full booking and payment record</summary><pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">{JSON.stringify(alert, null, 2)}</pre></details>
    {alert.status === "resolved" ? <p className="text-sm text-green-700">Refund reference: {alert.refundReference}{alert.adminNote && ` · ${alert.adminNote}`}</p> : <div className="space-y-3 border-t pt-4"><p className="text-sm text-slate-600">Complete the refund in Razorpay, then record its reference here.</p><label className="block text-sm font-medium">Completed refund reference<input className="mt-1 w-full rounded-lg border px-3 py-2" value={reference} onChange={e => setReference(e.target.value)} placeholder="Refund ID or transaction reference" /></label><label className="block text-sm font-medium">Admin note (optional)<textarea className="mt-1 w-full rounded-lg border px-3 py-2" value={note} onChange={e => setNote(e.target.value)} /></label><Button disabled={isLoading || !reference.trim()} onClick={finish}>{isLoading ? "Saving…" : "Mark refund completed"}</Button></div>}
  </article>;
}
export default function RefundAlerts() {
  const [status, setStatus] = useState("refund_required");
  const {
    data,
    error,
    isLoading,
    refetch
  } = useRefundAlertsQuery(status, {
    pollingInterval: 15000
  });
  const [reconcile, {
    isLoading: syncing
  }] = useReconcilePaymentsMutation();
  const sync = async () => {
    try {
      const result = await reconcile().unwrap();
      toast.info(`Checked ${result.checked} orders; processed ${result.processed}${result.failed ? `; ${result.failed} could not be checked` : ""}.`);
    } catch (e: any) {
      toast.error(e?.data?.message || "Unable to check payments");
    }
  };
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="flex items-center gap-2 text-2xl font-bold"><AlertTriangle className="text-orange-500" />Refund Alerts</h1><p className="mt-1 text-slate-600">Payments that could not be confirmed because seats were no longer available.</p></div><Button variant="outline" disabled={syncing} onClick={sync}><RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />{syncing ? "Checking…" : "Check pending payments"}</Button></div><div className="flex gap-2"><Button variant={status === "refund_required" ? "default" : "outline"} onClick={() => setStatus("refund_required")}>Open alerts ({status === "refund_required" ? data?.alerts.length || 0 : "…"})</Button><Button variant={status === "resolved" ? "default" : "outline"} onClick={() => setStatus("resolved")}>Resolved</Button></div>{isLoading ? <p>Loading refund alerts…</p> : error ? <p role="alert" className="text-red-600">Unable to load refund alerts. <button className="underline" onClick={() => refetch()}>Retry</button></p> : !data?.alerts.length ? <div className="rounded-xl border bg-white p-8 text-center text-slate-500">No {status === "resolved" ? "resolved refunds" : "open refund alerts"}.</div> : data.alerts.map(alert => <AlertCard key={alert._id} alert={alert} />)}</div>;
}
