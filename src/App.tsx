/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { TodoList } from './components/TodoList';
import { TempTodo } from './components/TempTodo';
import { ErrorMessage } from './components/ErrorMessage';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [changingTodoId, setChangingTodoId] = useState<number[]>([]);

  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

  const notCompletedTodos = todos.filter(todo => !todo.completed);

  const mainInputRef = useRef<HTMLInputElement>(null);

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      switch (selectedFilter) {
        case 'active':
          return !todo.completed;
        case 'completed':
          return todo.completed;
        default:
          return true;
      }
    });
  }, [todos, selectedFilter]);

  const onClickFilter = (filter: string) => {
    setSelectedFilter(filter);
  };

  const toSetEditingTodo = (id: number) => {
    setEditingTodoId(id);
  };

  const onSubmit = useCallback(async () => {
    const trimmedTitle = newTitle.trim();

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
      if (mainInputRef.current) {
        mainInputRef.current.disabled = true;
      }

      setTempTodo({ ...newTodo, id: 0 });

      const createdTodo = await addTodo(newTodo);

      setTodos(prev => {
        return [...prev, createdTodo];
      });
      setNewTitle('');
    } catch (error) {
      setErrorMessage('Unable to add a todo');
    } finally {
      setTempTodo(null);

      if (mainInputRef.current) {
        mainInputRef.current.disabled = false;
        mainInputRef.current.focus();
      }
    }
  }, [newTitle]);

  const onDelete = useCallback(async (id: number) => {
    setChangingTodoId([id]);

    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setChangingTodoId([]);
    }
  }, []);

  const clearAllCompleted = useCallback(async () => {
    const completedTodoIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    if (completedTodoIds.length === 0) {
      return;
    }

    try {
      setChangingTodoId(prev => [...prev, ...completedTodoIds]);

      const results = await Promise.allSettled(
        completedTodoIds.map(id => deleteTodo(id)),
      );

      const failedTodoIds = results
        .map((result, index) =>
          result.status === 'rejected' ? completedTodoIds[index] : null,
        )
        .filter(id => id !== null);

      if (failedTodoIds.length > 0) {
        setErrorMessage('Unable to delete a todo');
      } else {
        setErrorMessage('');
      }

      setTodos(prev =>
        prev.filter(
          todo =>
            !completedTodoIds.includes(todo.id) ||
            failedTodoIds.includes(todo.id),
        ),
      );
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setChangingTodoId(prev =>
        prev.filter(id => !completedTodoIds.includes(id)),
      );
    }
  }, [todos]);

  const toggleTodoStatus = useCallback(
    async ({ id, completed }: PartialTodo) => {
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
    },
    [],
  );

  const toggleAll = useCallback(async () => {
    const notCompletedTodoIds = todos
      .filter(todo => !todo.completed)
      .map(todo => todo.id);

    const isAllCompleted = notCompletedTodoIds.length === 0;
    const todosToUpdate = isAllCompleted
      ? todos
      : todos.filter(todo => !todo.completed);

    setChangingTodoId(todosToUpdate.map(todo => todo.id));

    try {
      const results = await Promise.allSettled(
        todosToUpdate.map(todo =>
          updateTodo({ id: todo.id, completed: !todo.completed }),
        ),
      );

      const successfulIds = results
        .map((result, index) =>
          result.status === 'fulfilled' ? todosToUpdate[index].id : null,
        )
        .filter(Boolean);

      setTodos(prev =>
        prev.map(todo =>
          successfulIds.includes(todo.id)
            ? { ...todo, completed: !todo.completed }
            : todo,
        ),
      );
    } catch (error) {
      setErrorMessage('Unable to update todos');
    } finally {
      setChangingTodoId([]);
    }
  }, [todos]);

  const onSubmitTodoEdit = useCallback(
    async (title: string, id: number, titleToUpdate: string) => {
      const enteredValue = titleToUpdate.trim();

      if (enteredValue === '') {
        return onDelete(id);
      }

      if (!enteredValue || title === enteredValue) {
        setEditingTodoId(null);

        return;
      }

      setChangingTodoId([id]);

      try {
        await updateTodo({ id, title: enteredValue });
        setTodos(prev => {
          return prev.map(todo =>
            todo.id === id ? { ...todo, title: enteredValue } : todo,
          );
        });
        setEditingTodoId(null);
      } catch (error) {
        setErrorMessage('Unable to update a todo');
      } finally {
        setChangingTodoId([]);
      }
    },
    [onDelete],
  );

  const onEsc = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setEditingTodoId(null);
    }
  };

  const onCloseErrorMessage = () => {
    setErrorMessage('');
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
    if (mainInputRef.current) {
      mainInputRef.current.focus();
    }
  }, [errorMessage, todos]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {todos.length !== 0 && (
            <button
              type="button"
              className={cn('todoapp__toggle-all', {
                active: notCompletedTodos.length === 0,
              })}
              data-cy="ToggleAllButton"
              onClick={() => toggleAll()}
            />
          )}

          <form
            onSubmit={event => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <input
              data-cy="NewTodoField"
              type="text"
              ref={mainInputRef}
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={event => setNewTitle(event.target.value)}
            />
          </form>
        </header>

        {todos.length > 0 && (
          <TodoList
            todos={filteredTodos}
            editingTodoId={editingTodoId}
            changingTodoId={changingTodoId}
            toggleTodoStatus={toggleTodoStatus}
            onSubmitTodoEdit={onSubmitTodoEdit}
            onDelete={onDelete}
            onEsc={onEsc}
            setEditingTodoId={toSetEditingTodo}
          />
        )}

        {tempTodo && <TempTodo tempTodo={tempTodo} />}

        {todos.length > 0 && (
          <Footer
            todos={todos}
            selectedFilter={selectedFilter}
            onClickFilter={onClickFilter}
            clearAllCompleted={clearAllCompleted}
          />
        )}
      </div>

      <ErrorMessage
        errorMessage={errorMessage}
        onCloseErrorMessage={onCloseErrorMessage}
      />
    </div>
  );
};
