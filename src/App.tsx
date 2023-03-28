import { useCallback } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useRecoilState } from "recoil";
import { toDoState } from "./atom";
import Board from "./components/Board";
import { useState } from "react";
import { useForm } from "react-hook-form";
import React from "react";
interface IForm {
  boardName: string;
}

function App() {
  const [toDos, setToDos] = useRecoilState(toDoState);
  const [boardCreate, setBoardCreate] = useState(false);
  const { register, handleSubmit, setValue } = useForm<IForm>();
  

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;

    if (source.droppableId === "boards") {
      if (source.index === destination.index) return;
      if (source.index !== destination.index) {
        setToDos((prev) => {
          const copyPrev = [...prev];
          const prevBoard = copyPrev[source.index];
          copyPrev.splice(source.index, 1);
          copyPrev.splice(destination.index, 0, prevBoard);
          return copyPrev;
        });
      }
    } else if (source.droppableId !== "boards") {
      if (!destination) return;
      // 같은 보드간 todo 이동
      if (source.droppableId === destination.droppableId) {
        setToDos((prev) => {
          const toDosCopy = [...prev];
          const boardIndex = toDosCopy.findIndex(
            (board) => board.id + "" === source.droppableId.split("-")[1]
          );
          const boardCopy = { ...toDosCopy[boardIndex] };
          const listCopy = [...boardCopy.toDos];
          const prevToDo = boardCopy.toDos[source.index];

          listCopy.splice(source.index, 1);
          listCopy.splice(destination.index, 0, prevToDo);

          boardCopy.toDos = listCopy;
          toDosCopy.splice(boardIndex, 1, boardCopy);

          return toDosCopy;
        });
      }
      // 다른 보드간 todo 이동
      if (source.droppableId !== destination.droppableId) {
        setToDos((prev) => {
          const copyPrev = [...prev];
          // 전체 toDos중에서 이동시킬 todo가 있는 board와 보낼 todo가 있는 board의 위치 찾기
          const sourceBoardIndex = copyPrev.findIndex(
            (v) => v.id + "" === source.droppableId.split("-")[1]
          );
          console.log(sourceBoardIndex);
          const destinationBoardIndex = copyPrev.findIndex(
            (v) => v.id + "" === destination.droppableId.split("-")[1]
          );
          console.log(destinationBoardIndex);
          // 위에서 찾은 보드들의 인덱스로 source board와 destination board복사
          const copySourceBoard = { ...copyPrev[sourceBoardIndex] };
          const copyDestinationBoard = { ...copyPrev[destinationBoardIndex] };
          // source board와 destination board의 모든 todo 복사
          const copySourceTask = [...copySourceBoard.toDos];
          const copyDestinationTask = [...copyDestinationBoard.toDos];
          // 이동시킬 todo 복사
          const PrevToDo = copySourceBoard.toDos[source.index];
          // 복사한 source board의 모든 todos에서 이동시킬 todo를 splice
          copySourceTask.splice(source.index, 1);
          // 복사한 destination board의 모든 todos사이에 이동시킬 todo 삽입
          copyDestinationTask.splice(destination.index, 0, PrevToDo);

          // 복사한 source board의 todos들을 위에서 splice하여 변경된 copySourceTask로 바꿔줌
          copySourceBoard.toDos = copySourceTask;
          // 복사한 destination board의 todos들을 위에서 splice하여 변경된 copyDestinationTask로 바꿔줌
          copyDestinationBoard.toDos = copyDestinationTask;

          // 변경된 suorceBoard와 destinationBoard를 copyPrev에 변경해줌
          copyPrev.splice(sourceBoardIndex, 1, copySourceBoard);
          copyPrev.splice(destinationBoardIndex, 1, copyDestinationBoard);

          return copyPrev;
        });
      }
    }
  };
  const onValid = ({ boardName }: IForm) => {
    setValue("boardName", "");
    setToDos((prev) => {
      return [...prev, { id: Date.now(), title: boardName, toDos: [] }];
    });
    setBoardCreate(false);
  };
  const toggleBoardModal = () => {
    setBoardCreate((prev) => !prev);    
  };
  

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-l from-slate-300 via-slate-200 to bg-slate-300">
          <Droppable droppableId="boards" direction="horizontal" type="boards">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex justify-center items-center mx-60 w-[1400px] gap-5 py-7 rounded-md"
              >
                {toDos.map((board, index) => (
                  <Draggable
                    key={board.id}
                    draggableId={"board-" + board.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-slate-100 relative min-w-[270px] min-h-[200px] flex flex-col items-center rounded-md"
                      >                        
                        <Board
                          parentProvided={provided}
                          toDo={board}
                          index={index}
                          boardId={board.id}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
      {boardCreate ? (
        <div className="items-center flex justify-center">
          <div className="w-[500px] h-[130px]  absolute top-40 flex flex-col justify-center items-center z-20 ">
            <h2 className="text-white text-3xl mb-5">보드 이름을 입력하세요</h2>
            <form className="" onSubmit={handleSubmit(onValid)}>
              <input
                className="z-20 w-[400px] text-white h-10 bg-slate-500"
                {...register("boardName")}
              ></input>
            </form>
          </div>
          <div
            onClick={toggleBoardModal}
            className="w-screen h-screen bg-black opacity-70 absolute top-0 z-10 z-10"
          ></div>
        </div>
      ) : null}
      <div className="relative">
        <div
          className="absolute w-14 h-14 rounded-full flex justify-center items-center right-10 bottom-20 bg-[#ffbe76] text-white cursor-pointer"
          onClick={toggleBoardModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
            />
          </svg>
        </div>
      </div>
    </>
  );
}

export default App;
