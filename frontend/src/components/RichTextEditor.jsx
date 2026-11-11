
import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

const toolbarButtonClass = (active) =>
  `px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
    active
      ? 'bg-[#DCE9D9] border-[#A9C6A5] text-[#292A25]'
      : 'bg-white border-[#E5E8DF] text-[#77786F] hover:bg-[#F0F2EA] hover:text-[#292A25]'
  }`;

function convertToHTML(value) {
  if (!value) return '';

  // Existing formatted notes are already HTML.
  if (/<\/?[a-z][\s\S]*>/i.test(value)) {
    return value;
  }

  // Convert older plain-text notes into paragraphs.
  return value
    .split('\n')
    .map((line) => {
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `<p>${escaped || '<br>'}</p>`;
    })
    .join('');
}

function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],

    content: convertToHTML(content),

    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
        'tiptap min-h-[180px] px-4 py-3 text-sm text-[#292A25] outline-none leading-7',
        'aria-label': 'Note content editor',
      },
    },
  });

  // Load the selected note when opening the editor.
  useEffect(() => {
    if (!editor) return;

    const nextContent = convertToHTML(content);

    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[230px] rounded-xl border border-[#E5E8DF] bg-white p-4 text-sm text-[#77786F]">
        Preparing editor...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E8DF] bg-white transition focus-within:border-[#A9C6A5] focus-within:ring-4 focus-within:ring-[#A9C6A5]/20">

      {/* Formatting toolbar */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E8DF] bg-[#FAFAF7] p-3">

        <button
          type="button"
          title="Bold"
          aria-label="Bold"
          aria-pressed={editor.isActive('bold')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarButtonClass(editor.isActive('bold'))}
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          title="Italic"
          aria-label="Italic"
          aria-pressed={editor.isActive('italic')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButtonClass(editor.isActive('italic'))}
        >
          <em>I</em>
        </button>

        <button
          type="button"
          title="Underline"
          aria-label="Underline"
          aria-pressed={editor.isActive('underline')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarButtonClass(editor.isActive('underline'))}
        >
          <span className="underline">U</span>
        </button>

        <button
          type="button"
          title="Highlight"
          aria-label="Highlight"
          aria-pressed={editor.isActive('highlight')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={toolbarButtonClass(editor.isActive('highlight'))}
        >
          <span className="rounded bg-yellow-200 px-1">H</span>
        </button>

        <span className="mx-1 hidden h-8 border-l border-[#E5E8DF] sm:block" />

        <button
          type="button"
          title="Bullet list"
          aria-label="Bullet list"
          aria-pressed={editor.isActive('bulletList')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClass(editor.isActive('bulletList'))}
        >
          • List
        </button>

        <button
          type="button"
          title="Numbered list"
          aria-label="Numbered list"
          aria-pressed={editor.isActive('orderedList')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButtonClass(editor.isActive('orderedList'))}
        >
          1. List
        </button>

        <button
          type="button"
          title="Checklist"
          aria-label="Checklist"
          aria-pressed={editor.isActive('taskList')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={toolbarButtonClass(editor.isActive('taskList'))}
        >
          ☑ Checklist
        </button>
      </div>

      {/* Writing area */}
      <div className="min-h-[205px] px-1 py-1 [&_.tiptap]:min-h-[190px] [&_.tiptap]:outline-none [&_.tiptap_p]:my-2 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_li]:my-1 [&_.tiptap_mark]:rounded [&_.tiptap_mark]:bg-yellow-200 [&_.tiptap_mark]:px-0.5 [&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-1 [&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-start [&_li[data-type=taskItem]]:gap-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default RichTextEditor;
