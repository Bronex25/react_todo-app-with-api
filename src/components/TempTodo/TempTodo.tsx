/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import cn from 'classnames';
import { PartialTodo } from '../../types/Todo';

type Props = {
  tempTodo: PartialTodo;
};

export const TempTodo: React.FC<Props> = ({ tempTodo }) => {
  return (
    <div
      data-cy="Todo"
      className={cn('todo', { completed: tempTodo.completed })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={tempTodo.completed}
        />
      </label>

      <span data-cy="TodoTitle" className="todo__title">
        {tempTodo.title}
      </span>
      <button type="button" className="todo__remove" data-cy="TodoDelete">
        ×
      </button>

      <div data-cy="TodoLoader" className="modal overlay is-active">
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
