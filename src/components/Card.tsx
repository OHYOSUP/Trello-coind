import { ITodo, toDoState } from "../atom";
import { Draggable } from "react-beautiful-dnd";
import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { useForm } from "react-hook-form";

interface IDraggableCardProps {
  toDo: ITodo;
  index: number;
  boardId: number;
}
interface ITodoEditForm {
  EditTodo: string;
}

function Card({ toDo, index, boardId }: IDraggableCardProps) {
  const [toDos, setToDos] = useRecoilState(toDoState);
  const [toDoEdit, setToDoEdit] = useState(false);

  const { register, handleSubmit, setValue, formState } =
    useForm<ITodoEditForm>();

  const onValid = ({ EditTodo }: ITodoEditForm) => {
    setToDos((prev) => {
      const prevCopy = [...prev];
      const findBoardIndex = prevCopy.findIndex(
        (board) => board.id === boardId
      );
      const boardCopy = { ...prevCopy[findBoardIndex] };
      const todosCopy = [...boardCopy.toDos];
      const findTodoIndex = boardCopy.toDos.findIndex((v) => v.id === toDo.id);

      todosCopy.splice(findTodoIndex, 1, { id: toDo.id, todo: EditTodo });
      boardCopy.toDos = todosCopy;
      prevCopy.splice(findBoardIndex, 1, boardCopy);

      return prevCopy;
    });

    setValue("EditTodo", "");
    setToDoEdit(false);
  };

  const todoEdit = () => {
    setToDoEdit((prev) => !prev);
  };
  const todoDelete = () => {
    setToDos((prev) => {
      const copyPrev = [...prev];
      const findBoardIndex = copyPrev.findIndex((v) => v.id === boardId);

      const copyBoard = { ...copyPrev[findBoardIndex] };
      const copyToDos = [...copyBoard.toDos];
      const findToDoIndex = copyToDos.findIndex((v) => v.id === toDo.id);
      console.log(findToDoIndex);
      copyToDos.splice(findToDoIndex, 1);
      copyBoard.toDos = copyToDos;
      copyPrev.splice(findBoardIndex, 1, copyBoard);
      return copyPrev;
    });
  };

  return (
    <Draggable index={index} draggableId={toDo.id + "-" + boardId}>
      {(provided) => (
        <li
          className="flex py-3 px-3 mb-3 w-[200px] bg-slate-400 justify-center items-center rounded-sm [&>div>div]:hover:opacity-100 "
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="flex justify-between items-center w-full h-10 text-[#130f40] [&>div]:hover:opacity-100">
            {toDoEdit ? (
              <form onSubmit={handleSubmit(onValid)}>
                <input
                  {...register("EditTodo", { required: "할 일을 입력하세요" })}
                  placeholder={
                    formState.errors.EditTodo
                      ? formState.errors.EditTodo.message
                      : ""
                  }
                  type="text"
                ></input>
              </form>
            ) : (
              <>
                <span className="w-full">{toDo.todo}</span>
                <div className="flex flex-col justify-center opacity-0 transition-opacity duration-200 pl-3 cursor-default">
                  <svg
                    onClick={todoDelete}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <svg
                    onClick={todoEdit}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                    />
                  </svg>
                </div>
              </>
            )}

            <div className="flex gap-2 opacity-0 transition-opacity ease-in-out duration-200 cursor-default"></div>
          </div>
        </li>
      )}
    </Draggable>
  );
}

export default React.memo(Card);
