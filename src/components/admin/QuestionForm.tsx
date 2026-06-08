import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { createQuestion, updateQuestion, type QuestionInput } from '../../lib/api'
import type { AdminQuestion } from '../../lib/types'
import { useToast } from '../../context/ToastContext'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  examId: string
  nextNumber: number
  editing: AdminQuestion | null
}

export function QuestionForm({ open, onClose, onSaved, examId, nextNumber, editing }: Props) {
  const { notify } = useToast()
  const [number, setNumber] = useState(editing?.question_number ?? nextNumber)
  const [text, setText] = useState(editing?.question_text ?? '')
  const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>(
    editing
      ? editing.options.map((o) => ({ text: o.option_text, isCorrect: o.is_correct }))
      : [{ text: '', isCorrect: true }, { text: '', isCorrect: false },
         { text: '', isCorrect: false }, { text: '', isCorrect: false }],
  )
  const [busy, setBusy] = useState(false)

  function setOpt(i: number, patch: Partial<{ text: string; isCorrect: boolean }>) {
    setOptions((o) => o.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  }
  function markCorrect(i: number) {
    setOptions((o) => o.map((row, idx) => ({ ...row, isCorrect: idx === i })))
  }
  function addOption() {
    if (options.length >= LABELS.length) return
    setOptions((o) => [...o, { text: '', isCorrect: false }])
  }
  function removeOption(i: number) {
    if (options.length <= 2) return
    setOptions((o) => {
      const next = o.filter((_, idx) => idx !== i)
      if (!next.some((r) => r.isCorrect)) next[0].isCorrect = true
      return next
    })
  }

  async function save() {
    if (text.trim().length < 3) { notify('Soru metni gerekli.', 'error'); return }
    const clean = options.map((o) => o.text.trim())
    if (clean.some((t) => !t)) { notify('Tüm şıkları doldurun.', 'error'); return }
    if (!options.some((o) => o.isCorrect)) { notify('Doğru şıkkı işaretleyin.', 'error'); return }

    const payload: QuestionInput = {
      examId,
      questionNumber: number,
      questionText: text.trim(),
      options: options.map((o, i) => ({ label: LABELS[i], text: o.text.trim(), isCorrect: o.isCorrect })),
    }
    setBusy(true)
    try {
      if (editing) await updateQuestion(editing.id, payload)
      else await createQuestion(payload)
      notify(editing ? 'Soru güncellendi.' : 'Soru eklendi.', 'success')
      onSaved()
      onClose()
    } catch (e) {
      notify((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Soruyu Düzenle (#${editing.question_number})` : 'Yeni Soru'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>İptal</Button>
          <Button loading={busy} onClick={save}>{editing ? 'Kaydet' : 'Ekle'}</Button>
        </>
      }
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid grid-cols-[100px_1fr] gap-3">
          <div>
            <label className="label">Sıra No</label>
            <input type="number" min={1} className="input" value={number}
              onChange={(e) => setNumber(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="label">Soru Metni</label>
          <textarea className="input min-h-[90px] resize-y" value={text}
            onChange={(e) => setText(e.target.value)} placeholder="Soruyu yazın…" />
        </div>
        <div>
          <label className="label">Şıklar (doğru olanı işaretleyin)</label>
          <div className="space-y-2">
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={o.isCorrect} onChange={() => markCorrect(i)}
                  className="h-4 w-4 accent-emerald-600" title="Doğru cevap" />
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-bold dark:bg-slate-800">{LABELS[i]}</span>
                <input className="input flex-1" value={o.text} onChange={(e) => setOpt(i, { text: e.target.value })}
                  placeholder={`${LABELS[i]} şıkkı`} />
                <button onClick={() => removeOption(i)} disabled={options.length <= 2}
                  className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30 dark:hover:bg-rose-950/40" title="Sil">✕</button>
              </div>
            ))}
          </div>
          {options.length < LABELS.length && (
            <button onClick={addOption} className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              + Şık ekle
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
