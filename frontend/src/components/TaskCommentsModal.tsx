import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { taskApi } from '../hooks/useTasks';
import type { Task } from '../types';

export function TaskCommentsModal({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const taskId = task ? String(task._id ?? task.id) : '';
  const commentsQuery = useQuery({
    queryKey: ['tasks', taskId, 'comments'],
    queryFn: () => taskApi.getComments(taskId),
    enabled: Boolean(taskId),
  });
  const addCommentMutation = useMutation({
    mutationFn: taskApi.addComment,
    onSuccess: async () => {
      setMessage('');
      await queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'comments'] });
    },
  });

  if (!task) return null;

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      addCommentMutation.mutate({ id: taskId, message: trimmedMessage });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
      <section className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-violet-300">Task activity</p>
            <h2 className="text-xl font-semibold">{task.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-2 text-sm">Close</button>
        </div>

        <div className="max-h-72 space-y-3 overflow-y-auto">
          {commentsQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading comments...</p>
          ) : commentsQuery.isError ? (
            <p className="text-sm text-rose-400">Unable to load comments.</p>
          ) : commentsQuery.data?.length ? (
            commentsQuery.data.map((comment) => (
              <article key={comment._id ?? `${comment.createdAt}-${comment.message}`} className="rounded-xl bg-slate-800 p-3">
                <p className="text-sm text-slate-200">{comment.message}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {comment.user?.name ?? 'Team member'} · {new Date(comment.createdAt).toLocaleString()}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-400">No comments yet.</p>
          )}
        </div>

        <form onSubmit={submitComment} className="mt-5 space-y-3">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={2000}
            required
            rows={3}
            aria-label="Comment"
            placeholder="Add a comment..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-violet-500"
          />
          {addCommentMutation.isError && <p className="text-sm text-rose-400">Unable to add comment.</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addCommentMutation.isPending || !message.trim()}
              className="rounded-xl bg-violet-600 px-4 py-2 font-medium disabled:opacity-50"
            >
              {addCommentMutation.isPending ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
