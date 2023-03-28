import { IBoard, toDoState } from "../atom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { Draggable, DraggableProvided, Droppable } from "react-beautiful-dnd";
import Card from "./Card";
import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
interface IToDo {
  toDo: IBoard;
  index: number;
  boardId: number;
  parentProvided: DraggableProvided;
}
interface ISnapshot {
  isDraggingFromThis: boolean;
  isDraggingOver: boolean;
}

const Container = styled.ul<ISnapshot>`
  min-width: 200px;
  min-height: 200px;
  display: flex;
  margin-top: 20px;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  color: #2f3542;
  padding: 20px 0px;
  transition: background-color 0.2s ease-in-out;
  background-color: ${(props) =>
    props.isDraggingOver
      ? "#ff4757"
      : props.isDraggingFromThis
      ? "#ced6e0"
      : ""};
`;

interface IForm {
  newTodo: string;
}
interface INewBoardTitle {
  newBoardTitle: string;
}
function Board({ toDo, index, boardId }: IToDo) {
  const [toDos, setToDos] = useRecoilState(toDoState);
  const [boardEdit, setBoardEdit] = useState(false);

  

  const { register, handleSubmit, setValue, formState } = useForm<IForm>();

  const { register: newBoardTitleRegister, handleSubmit: onBoardTitleSubmit } =
    useForm<INewBoardTitle>();

  const onValid = ({ newTodo }: IForm) => {
    const newTask = { id: Date.now(), todo: newTodo };
    setToDos((prev) => {
      const prevCopy = [...prev];
      const findBoardIndex = prevCopy.findIndex((v) => v.id === boardId);
      const boardCopy = { ...prev[findBoardIndex] };

      boardCopy.toDos = [newTask, ...boardCopy.toDos];
      prevCopy.splice(findBoardIndex, 1, boardCopy);
      return prevCopy;
    });
    setValue("newTodo", "");
  };

  const onBoardDelete = () => {
    setToDos((prev) => {
      const copyPrev = [...prev];
      const findIndex = copyPrev.findIndex((v) => v.id === boardId);
      copyPrev.splice(findIndex, 1);
      return copyPrev;
    });
  };

  const onBoardEdit = () => {
    setBoardEdit((prev) => !prev);
  };
  const onBoardEditValid = ({ newBoardTitle }: INewBoardTitle) => {
    setToDos((prev) => {
      const prevCopy = [...prev];
      const findIndex = prevCopy.findIndex((v) => v.id === boardId);
      const copyBoard = { ...prevCopy[findIndex] };
      copyBoard.title = newBoardTitle;

      prevCopy.splice(findIndex, 1, copyBoard);
      return prevCopy;
    });
    setBoardEdit((prev) => !prev);
  };

  
  return (
    // todo를 이동할때 자꾸 화면 밖으로 나가는데 type을 지정해 줘야 함
    <Droppable droppableId={"board-" + toDo.id} type="board">
      {(provided, snapshot) => (
        <>
          <div className="flex justify-center items-center w-full h-10 relative [&>div]:hover:opacity-100">
            <span className="rounded-md h-16 w-full flex justify-center items-center bg-gradient-to-b from-slate-400 to-slate-100 text-[#130f40] font-bold">
              {boardEdit ? (
                <form onSubmit={onBoardTitleSubmit(onBoardEditValid)}>
                  <input
                    className="h-7 px-3"
                    {...newBoardTitleRegister("newBoardTitle")}
                    type="text"
                  ></input>
                </form>
              ) : (
                toDo.title
              )}
            </span>
            <div className="absolute flex gap-3 right-3 cursor-default opacity-0 transition-opacity ease-in-out duration-200">
              <svg
                onClick={onBoardDelete}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15"
                />
              </svg>
              <svg
                onClick={onBoardEdit}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
            </div>
          </div>
          <Container
            {...provided.droppableProps}
            ref={provided.innerRef}
            isDraggingFromThis={Boolean(snapshot.draggingFromThisWith)}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {toDo.toDos.map((item, index) => (
              <div key={index} className="flex items-center px-4 ">
                <Card  toDo={item} index={index} boardId={boardId} />
                
              </div>
            ))}
          </Container>
          <form onSubmit={handleSubmit(onValid)}>
            <input
              {...register("newTodo", {
                required: { value: true, message: "할 일을 입력하세요" },
              })}
              className="mb-3 w-[220px] p-2"
              type="text"
              placeholder={
                formState.errors.newTodo ? "할 일을 입력하세요" : "새 할일"
              }
            ></input>
          </form>
        </>
      )}
    </Droppable>
  );
}

export default React.memo(Board);
