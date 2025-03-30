/* eslint-disable react/display-name */
import React, { memo, useRef, useEffect } from 'react';
import { Todo } from '../../types/Todo';

type Props = {
  todo: Todo;
  onSubmitTodoEdit: (title: string, id: number, newTitle: string) => void;
  onEsc: (event: React.KeyboardEvent) => void;
  setEditingTodoId: (id: number) => void;
};

export const EditingForm: React.FC<Props> = memo(
  ({ onSubmitTodoEdit, onEsc, todo, setEditingTodoId }) => {
    const editInputRef = useRef<HTMLInputElement>(null);

    const onSubmit = () => {
      let newTitle = '';

      if (editInputRef.current) {
        newTitle = editInputRef.current?.value;
      }

      onSubmitTodoEdit(todo.title, todo.id, newTitle);
    };

    useEffect(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, []);

    return (
      <form
        onSubmit={event => {
          event.preventDefault();
          onSubmit();
        }}
        onBlur={() => onSubmit()}
        onKeyUp={onEsc}
      >
        <input
          data-cy="TodoTitleField"
          type="text"
          ref={editInputRef}
          className="todo__title-field"
          placeholder="Empty todo will be deleted"
          defaultValue={todo.title}
          onDoubleClick={() => setEditingTodoId(todo.id)}
        />
      </form>
    );
  },
);
