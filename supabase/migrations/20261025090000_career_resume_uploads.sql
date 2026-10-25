-- Private, temporary staging for career resumes. Files are uploaded with a
-- short-lived signed URL, downloaded by the server, emailed as attachments,
-- and deleted immediately after processing.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'career-resumes',
  'career-resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No authenticated or anonymous read policies are created. Access is limited
-- to signed uploads and the server-only service role.
