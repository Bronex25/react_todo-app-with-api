/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { PartialTodo, Todo } from './types/Todo';
import cn from 'classnames';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [changingTodoId, setChangingTodoId] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      switch (selectedFilter) {
        case 'active':
          return !todo.completed;
        case 'completed':
          return todo.completed;
        default:
          return todo;
      }
    });
  }, [todos, selectedFilter]);

  const onClickFilter = (filter: string) => {
    setSelectedFilter(filter);
  };

  const onSubmit = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setErrorMessage('Title should not be empty');

      return;
    }

    const newTodo: Omit<Todo, 'id'> = {
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,
    };

    try {
      if (inputRef.current) {
        inputRef.current.disabled = true;
      }

      setTempTodo({ ...newTodo, id: 0 });

      const createdTodo = await addTodo(newTodo);

      setTodos(prev => {
        return [...prev, createdTodo];
      });
      setTitle('');
      setTempTodo(null);
    } catch (error) {
      setErrorMessage('Unable to add a todo');
    } finally {
      if (inputRef.current) {
        inputRef.current.disabled = false;
        inputRef.current.focus();
      }
    }
  };

  const onDelete = async (id: number) => {
    setChangingTodoId([id]);

    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setChangingTodoId([]);
    }
  };

  const clearAllCompleted = async () => {
    const completedTodoIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    if (completedTodoIds.length === 0) {
      return;
    }

    try {
      setChangingTodoId(prev => [...prev, ...completedTodoIds]);
      await Promise.all(completedTodoIds.map(id => deleteTodo(id)));
      setTodos(prev => prev.filter(t => !t.completed));
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setChangingTodoId(prev =>
        prev.filter(id => !completedTodoIds.includes(id)),
      );
    }
  };

  const toggleTodoStatus = async ({ id, completed }: PartialTodo) => {
    if (id === undefined || completed === undefined) {
      return;
    }

    setChangingTodoId(prev => [...prev, id]);

    try {
      await updateTodo({ id, completed });
      setTodos(prev => {
        return prev.map(todo =>
          todo.id === id ? { ...todo, completed } : todo,
        );
      });
    } catch (error) {
      setErrorMessage('Unable to update a todo');
    } finally {
      setChangingTodoId(prev => prev.filter(t => t !== id));
    }
  };

  const toggleAll = async () => {
    const notCompletedTodoIds = todos
      .filter(todo => !todo.completed)
      .map(todo => todo.id);

    setChangingTodoId(
      notCompletedTodoIds.length === 0
        ? todos.map(todo => todo.id)
        : notCompletedTodoIds,
    );

    try {
      if (notCompletedTodoIds.length === 0) {
        await Promise.all(
          todos.map(todo =>
            updateTodo({ id: todo.id, completed: !todo.completed }),
          ),
        );
        setTodos(prev => prev.map(t => ({ ...t, completed: !t.completed })));
      } else {
        await Promise.all(
          notCompletedTodoIds.map(id => updateTodo({ id, completed: true })),
        );
        setTodos(prev => prev.map(t => ({ ...t, completed: true })));
      }
    } catch (error) {
      setErrorMessage('Unable to update todos');
    } finally {
      setChangingTodoId([]);
    }
  };

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'));
  }, []);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (errorMessage) {
      timerId = setTimeout(() => setErrorMessage(''), 3000);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [errorMessage]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [errorMessage]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
            onClick={() => toggleAll()}
          />

          <form
            onSubmit={event => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <input
              data-cy="NewTodoField"
              type="text"
              ref={inputRef}
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </form>
        </header>

        {todos.length > 0 && (
          <section className="todoapp__main" data-cy="TodoList" hidden={!todos}>
            {filteredTodos.map(todo => {
              return (
                <div
                  data-cy="Todo"
                  className={cn('todo', { completed: todo.completed })}
                  key={todo.id}
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
            })}

            {/* This is a completed todo */}
            <div data-cy="Todo" className="todo completed">
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                Completed Todo
              </span>

              {/* Remove button appears only on hover */}
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>

              {/* overlay will cover the todo while it is being deleted or updated */}
            </div>

            {/* This todo is an active todo */}
            <div data-cy="Todo" className="todo">
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                Not Completed Todo
              </span>
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>

              <div data-cy="TodoLoader" className="modal overlay">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>

            {/* This todo is being edited */}
            <div data-cy="Todo" className="todo">
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                />
              </label>

              {/* This form is shown instead of the title and remove button */}
              <form>
                <input
                  data-cy="TodoTitleField"
                  type="text"
                  className="todo__title-field"
                  placeholder="Empty todo will be deleted"
                  value="Todo is being edited now"
                />
              </form>

              <div data-cy="TodoLoader" className="modal overlay">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>

            {/* This todo is in loadind state */}
            <div data-cy="Todo" className="todo">
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                Todo is being saved now
              </span>

              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>

              {/* 'is-active' class puts this modal on top of the todo */}
              <div data-cy="TodoLoader" className="modal overlay is-active">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          </section>
        )}

        {tempTodo && (
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
        )}

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              3 items left
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

            {/* this button should be disabled if there are no completed todos */}
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
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {errorMessage}
      </div>
    </div>
  );
};
