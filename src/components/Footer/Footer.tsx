/* eslint-disable react/display-name */
import React, { memo } from 'react';
import { Todo } from '../../types/Todo';

type Props = {
  todos: Todo[];
  selectedFilter: string;
  onClickFilter: (option: string) => void;
  clearAllCompleted: () => Promise<void>;
};

export const Footer: React.FC<Props> = memo(
  ({ todos, onClickFilter, selectedFilter, clearAllCompleted }) => {
    const notCompletedTodos = todos.filter(todo => !todo.completed);

    return (
      <footer className="todoapp__footer" data-cy="Footer">
        <span className="todo-count" data-cy="TodosCounter">
          {`${notCompletedTodos.length} items left`}
        </span>

        <nav className="filter" data-cy="Filter">
          <a
            href="#/"
            data-cy="FilterLinkAll"
            className={`filter__link ${selectedFilter === 'all' ? 'selected' : ''}`}
            onClick={() => onClickFilter('all')}
          >
            All
          </a>

          <a
            href="#/active"
            className={`filter__link ${selectedFilter === 'active' ? 'selected' : ''}`}
            data-cy="FilterLinkActive"
            onClick={() => onClickFilter('active')}
          >
            Active
          </a>

          <a
            href="#/completed"
            className={`filter__link ${selectedFilter === 'completed' ? 'selected' : ''}`}
            data-cy="FilterLinkCompleted"
            onClick={() => onClickFilter('completed')}
          >
            Completed
          </a>
        </nav>

        <button
          type="button"
          className="todoapp__clear-completed"
          data-cy="ClearCompletedButton"
          onClick={() => clearAllCompleted()}
          disabled={!todos.find(t => t.completed)}
        >
          Clear completed
        </button>
      </footer>
    );
  },
);
