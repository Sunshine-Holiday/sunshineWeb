import { useState } from "react";
import { toast } from "react-toastify";
import { MessageSquare, Save, Send, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageTemplate, MessageBatch, useMessagingQuery, useSaveMessageTemplateMutation, useDeleteMessageTemplateMutation, useSendMessagesMutation } from "@/store/api/adminCommunication";
const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300";
export default function Messaging() {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useMessagingQuery(undefined, {
    pollingInterval: 15000
  });
  const [save, {
    isLoading: saving
  }] = useSaveMessageTemplateMutation();
  const [remove, {
    isLoading: deleting
  }] = useDeleteMessageTemplateMutation();
  const [send, {
    isLoading: sending
  }] = useSendMessagesMutation();
  const [phones, setPhones] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [contentSid, setContentSid] = useState("");
  const [editingId, setEditingId] = useState<string>();
  const [lastBatch, setLastBatch] = useState<MessageBatch>();
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [deleteId, setDeleteId] = useState<string>();
  const select = (template: MessageTemplate, edit = false) => {
    setName(template.name);
    setMessage(template.message);
    setContentSid(template.contentSid || "");
    setEditingId(edit ? template._id : undefined);
    setRequestId(crypto.randomUUID());
  };
  const addNumbers = () => {
    const numbers = phones.split(/[\n,;]+/).map(p => p.trim().replace(/[\s()-]/g, "")).filter(Boolean).map(p => /^[6-9]\d{9}$/.test(p) ? `+91${p}` : /^91\d{10}$/.test(p) ? `+${p}` : p);
    const unique = [...new Set(numbers)];
    if (!unique.length || unique.length > 100 || unique.some(p => !/^\+[1-9]\d{7,14}$/.test(p))) {
      toast.error("Enter up to 100 valid numbers with a country code or 10-digit Indian numbers");
      return;
    }
    setPhones(unique.join("\n"));
    setRequestId(crypto.randomUUID());
    toast.success(`${unique.length} phone number(s) added`);
  };
  const saveTemplate = async () => {
    try {
      await save({
        id: editingId,
        name,
        message,
        contentSid
      }).unwrap();
      toast.success(editingId ? "Template updated" : "Template saved");
      setEditingId(undefined);
    } catch (e: any) {
      toast.error(e?.data?.message || "Unable to save template");
    }
  };
  const sendBatch = async (channel: "sms" | "whatsapp") => {
    try {
      const result = await send({
        requestId: `${requestId}-${channel}`,
        channel,
        phones,
        message,
        contentSid
      }).unwrap();
      setLastBatch(result.batch);
      const failed = result.batch.results.filter(r => ["failed", "unknown", "pending"].includes(r.status)).length;
      if (failed) toast.warning(`${failed} recipient(s) need attention. Check the results below.`);else toast.success("Messages accepted by the provider");
      // Editing the message or recipient list starts a new request. Repeated
      // clicks on unchanged content reuse this ID to prevent duplicate sends.
    } catch (e: any) {
      toast.error(e?.data?.message || "Send result unavailable. Check message history before retrying.");
      refetch();
    }
  };
  const batches = data?.batches || [];
  const results = lastBatch ? batches.find(b => b._id === lastBatch._id) || lastBatch : undefined;
  return <div className="space-y-6">
    <div><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><MessageSquare className="text-orange-500" />WhatsApp & SMS Management</h1><p className="mt-1 text-slate-600">Send messages to multiple customers and reuse saved templates.</p></div>
    {error && <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">Unable to load messaging. <button onClick={() => refetch()} className="underline">Retry</button></div>}
    <div className="space-y-4 rounded-xl border bg-white p-5">
      <label className="block font-medium" htmlFor="message-phones">Phone numbers</label>
      <textarea id="message-phones" className={inputClass} rows={3} value={phones} disabled={sending} onChange={e => {
        setPhones(e.target.value);
        setRequestId(crypto.randomUUID());
      }} placeholder="9876543210, +919876543211" />
      <Button variant="outline" disabled={sending || !phones.trim()} onClick={addNumbers}>Add numbers</Button>
      <p className="text-sm text-slate-500">Separate up to 100 numbers with commas, semicolons or new lines. Duplicate numbers are removed.</p>
      <label className="block font-medium" htmlFor="message-body">Message</label>
      <textarea id="message-body" className={inputClass} rows={5} maxLength={1600} value={message} disabled={sending} onChange={e => {
        setMessage(e.target.value);
        setRequestId(crypto.randomUUID());
      }} placeholder="Type your message…" />
      <p className="text-right text-xs text-slate-500">{message.length}/1600</p>
      <div className="flex flex-wrap gap-3">
        <Button disabled={sending || !phones.trim() || !message.trim() || !data?.configured.whatsapp} onClick={() => sendBatch("whatsapp")} className="bg-green-600 hover:bg-green-700"><Send className="mr-2 h-4 w-4" />{sending ? "Sending…" : "Send via WhatsApp"}</Button>
        <Button disabled={sending || !phones.trim() || !message.trim() || !data?.configured.sms} onClick={() => sendBatch("sms")}><Send className="mr-2 h-4 w-4" />Send via SMS</Button>
        <Button variant="outline" disabled={sending} onClick={() => {
          setRequestId(crypto.randomUUID());
          setLastBatch(undefined);
          toast.info("Ready for a new send");
        }}>Start new send</Button>
      </div>
      {!isLoading && (!data?.configured.whatsapp || !data?.configured.sms) && <p className="text-sm text-amber-700">{!data?.configured.whatsapp && "WhatsApp"}{!data?.configured.whatsapp && !data?.configured.sms && " and "}{!data?.configured.sms && "SMS"} sending needs a configured messaging account. You can save templates now.</p>}
      <p className="text-sm text-slate-500">WhatsApp custom text is available during an active customer conversation. For messages outside that window, use an approved WhatsApp template below.</p>
      <div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="template-name" className="mb-1 block text-sm font-medium">Template name</label><input id="template-name" className={inputClass} maxLength={100} value={name} onChange={e => setName(e.target.value)} /></div><div><label htmlFor="template-sid" className="mb-1 block text-sm font-medium">Approved WhatsApp template SID (optional)</label><input id="template-sid" className={inputClass} value={contentSid} disabled={sending} placeholder="HX…" onChange={e => {
            setContentSid(e.target.value);
            setRequestId(crypto.randomUUID());
          }} /><p className="mt-1 text-xs text-slate-500">When supplied, WhatsApp sends the approved template’s content. Use a template without variables.</p></div></div>
      <div className="flex gap-2"><Button disabled={saving || !name.trim() || !message.trim()} onClick={saveTemplate}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : editingId ? "Update template" : "Save message template"}</Button>{editingId && <Button variant="outline" onClick={() => setEditingId(undefined)}>Save as new instead</Button>}</div>
    </div>
    <section><h2 className="mb-3 text-lg font-semibold">Saved templates</h2>{isLoading ? <p>Loading templates…</p> : !data?.templates.length ? <p className="text-slate-500">No templates saved yet.</p> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.templates.map(t => <article key={t._id} className="rounded-xl border bg-white p-4"><h3 className="font-semibold">{t.name}</h3><p className="my-3 whitespace-pre-wrap text-sm text-slate-600">{t.message}</p><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={sending} onClick={() => select(t)}>Use template</Button><Button size="sm" variant="outline" disabled={sending} onClick={() => select(t, true)}><Pencil className="mr-1 h-3 w-3" />Edit</Button><Button size="sm" variant="outline" onClick={() => setDeleteId(t._id)}><Trash2 className="h-3 w-3" /><span className="sr-only">Delete {t.name}</span></Button></div>{deleteId === t._id && <div className="mt-3 flex items-center gap-2 text-sm"><span>Delete template?</span><Button size="sm" variant="destructive" disabled={deleting} onClick={async () => {
              try {
                await remove(t._id).unwrap();
                setDeleteId(undefined);
              } catch {
                toast.error("Unable to delete template");
              }
            }}>Delete</Button><Button size="sm" variant="outline" onClick={() => setDeleteId(undefined)}>Cancel</Button></div>}</article>)}</div>}</section>
    {results && <section className="rounded-xl border bg-white p-4"><h2 className="mb-2 font-semibold">Latest send results</h2>{results.results.map(r => <div key={r.phone} className="border-t py-2 text-sm"><span className="font-medium">{r.phone}</span> — {r.status}{r.error && <p className="text-red-600">{r.error}</p>}</div>)}</section>}
    <section><h2 className="mb-3 text-lg font-semibold">Recent message history</h2><p className="mb-3 text-sm text-slate-500">Queued or sent statuses show provider acceptance; they do not confirm delivery. Check pending or unknown results with your messaging provider before retrying.</p>{batches.map(b => <details key={b._id} className="mb-2 rounded-lg border bg-white p-3"><summary className="cursor-pointer text-sm font-medium">{b.channel.toUpperCase()} · {new Date(b.createdAt).toLocaleString()} · {b.results.length} recipients</summary><p className="my-2 whitespace-pre-wrap text-sm">{b.message}</p>{b.results.map(r => <p key={r.phone} className="py-1 text-sm">{r.phone} — {r.status}{r.error ? `: ${r.error}` : ""}</p>)}</details>)}</section>
  </div>;
}
