import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, formatDate } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, Stars } from "./ui-bits";
function ReviewSection({ target, reviews, onChanged }) {
  const { user } = useAuth();
  const own = reviews.find((review) => review.userId === user?.id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (own) {
      setRating(own.rating);
      setComment(own.comment ?? "");
    }
  }, [own?.id]);
  async function submit(event) {
    event.preventDefault();
    if (rating < 1) {
      setError("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (own) {
        await api.put(`/reviews/${own.id}`, { rating, comment });
        toast.success("Avalia\xE7\xE3o atualizada.");
      } else {
        await api.post("/reviews", { ...target, rating, comment });
        toast.success("Avalia\xE7\xE3o publicada.");
      }
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel salvar.");
    } finally {
      setSaving(false);
    }
  }
  async function remove() {
    if (!own || !window.confirm("Excluir sua avalia\xE7\xE3o?")) return;
    try {
      await api.delete(`/reviews/${own.id}`);
      toast.success("Avalia\xE7\xE3o exclu\xEDda.");
      setRating(0);
      setComment("");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel excluir.");
    }
  }
  const showForm = user && (!own || editing);
  return <div>
      {reviews.length === 0 ? <p className="muted">Ainda não há avaliações. Seja o primeiro a avaliar.</p> : null}
      <div className="review-list">
        {reviews.map((review) => <article key={review.id} className="review-item">
            <div className="review-head">
              <Avatar name={review.user.fullName} photo={review.user.photoUrl} />
              <div>
                <div className="review-name">{review.user.fullName}</div>
                <div className="review-date">
                  {formatDate(review.createdAt)} · <Stars value={review.rating} size={13} />
                </div>
              </div>
              {review.userId === user?.id ? <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => setEditing(true)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn--outline btn--sm" onClick={remove}>
                    Excluir
                  </button>
                </div> : null}
            </div>
            {review.comment ? <p className="review-text">{review.comment}</p> : null}
          </article>)}
      </div>

      {user && own && !editing ? <p className="muted" style={{ marginTop: 16 }}>
          Você já avaliou este conteúdo.{" "}
          <button type="button" className="auth-link" onClick={() => setEditing(true)} style={{ background: "none", border: 0, cursor: "pointer" }}>
            Editar avaliação
          </button>
        </p> : null}

      {showForm ? <form className="inline-form" onSubmit={submit}>
          <div className="field">
            <label>Sua nota</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={value <= rating ? "is-on" : ""} onClick={() => setRating(value)} aria-label={`${value} estrelas`}>
                  ★
                </button>)}
            </div>
          </div>
          <div className="field">
            <label htmlFor="review-comment">Comentário (opcional)</label>
            <textarea id="review-comment" className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2e3} />
          </div>
          {error ? <div className="form-error">{error}</div> : null}
          <div className="form-actions">
            <button type="submit" className="btn btn--yellow btn--sm" disabled={saving}>
              {saving ? "Salvando\u2026" : own ? "Salvar avalia\xE7\xE3o" : "Publicar avalia\xE7\xE3o"}
            </button>
            {editing ? <button type="button" className="btn btn--outline btn--sm" onClick={() => setEditing(false)}>
                Cancelar
              </button> : null}
          </div>
        </form> : null}
    </div>;
}
function CommentSection({ target, comments, onChanged }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/comments", { ...target, content });
      setContent("");
      toast.success("Coment\xE1rio publicado.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel comentar.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(id) {
    if (!window.confirm("Excluir este coment\xE1rio?")) return;
    try {
      await api.delete(`/comments/${id}`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel excluir.");
    }
  }
  return <div>
      {comments.length === 0 ? <p className="muted">Nenhum comentário ainda.</p> : null}
      <div className="review-list">
        {comments.map((comment) => <article key={comment.id} className="review-item">
            <div className="review-head">
              <Avatar name={comment.user.fullName} photo={comment.user.photoUrl} />
              <div>
                <div className="review-name">{comment.user.fullName}</div>
                <div className="review-date">{formatDate(comment.createdAt)}</div>
              </div>
              {comment.user.id === user?.id || user?.role === "ADMIN" ? <button type="button" className="btn btn--outline btn--sm" style={{ marginLeft: "auto" }} onClick={() => remove(comment.id)}>
                  Excluir
                </button> : null}
            </div>
            <p className="review-text">{comment.content}</p>
          </article>)}
      </div>

      {user ? <form className="inline-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="comment-content">Deixe um comentário</label>
            <textarea id="comment-content" className="textarea" value={content} onChange={(e) => setContent(e.target.value)} required minLength={2} maxLength={2e3} />
          </div>
          {error ? <div className="form-error">{error}</div> : null}
          <div>
            <button type="submit" className="btn btn--yellow btn--sm" disabled={saving}>
              {saving ? "Enviando\u2026" : "Comentar"}
            </button>
          </div>
        </form> : null}
    </div>;
}
export {
  CommentSection,
  ReviewSection
};
