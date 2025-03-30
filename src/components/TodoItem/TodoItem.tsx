/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { PartialTodo, Todo } from '../../types/Todo';
import cn from 'classnames';
import { EditingForm } from '../EditingForm';
import React, { memo } from 'react';

type Props = {
  todo: Todo;
  editingTodoId: number | null;
  changingTodoId: number[];
  toggleTodoStatus: ({ id, completed }: PartialTodo) => Promise<void>;
  onSubmitTodoEdit: (title: string, id: number, newTitle: string) => void;
  onDelete: (id: number) => void;
  onEsc: (event: React.KeyboardEvent) => void;
  setEditingTodoId: (id: number) => void;
};

export const TodoItem: React.FC<Props> = memo(
  ({
    todo,
    editingTodoId,
    toggleTodoStatus,
    onSubmitTodoEdit,
    changingTodoId,
    onDelete,
    onEsc,
    setEditingTodoId,
  }) => {
    return (
      <div
        data-cy="Todo"
        className={cn('todo', { completed: todo.completed })}
        key={todo.id}
        onDoubleClick={() => setEditingTodoId(todo.id)}
      >
        <label className="todo__status-label">
          <input
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            onClick={() =>
              toggleTodoStatus({
                id: todo.id,
                completed: !todo.completed,
              })
            }
            checked={todo.completed}
          />
        </label>

        {editingTodoId === todo.id ? (
          <EditingForm
            todo={todo}
            onSubmitTodoEdit={onSubmitTodoEdit}
            onEsc={onEsc}
            setEditingTodoId={setEditingTodoId}
          />
        ) : (
          <>
            <span data-cy="TodoTitle" className="todo__title">
              {todo.title}
            </span>
            <button
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
              onClick={() => onDelete(todo.id)}
              disabled={changingTodoId.includes(todo.id)}
            >
              ×
            </button>
          </>
        )}

        <div
          data-cy="TodoLoader"
          className={cn('modal overlay', {
            'is-active': changingTodoId.includes(todo.id),
          })}
        >
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      </div>
    );
  },
);

TodoItem.displayName = 'Todo Item';
