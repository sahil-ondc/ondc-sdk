import React, { createContext, useReducer } from "react";
import Toast from "../components/shared/toast/toast";
import { toast_actions } from "../components/shared/toast/utils/toast";

export const ToastContext = createContext([]);

export default function ToastProvider({ ...props }) {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case toast_actions.ADD_TOAST: {
        handleRemoveToast(action.payload.id, 5000);
        return [...state, action.payload];
      }
      case toast_actions.REMOVE_TOAST: {
        return state.filter((toast) => toast.id !== action.id);
      }
      default:
        return state;
    }
  }, []);
  function handleRemoveToast(id, duration) {
    setTimeout(() => {
      dispatch({
        type: toast_actions.REMOVE_TOAST,
        id: id,
      });
    }, duration);
  }
  return (
    <ToastContext.Provider value={dispatch}>
      {state.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div
            style={{ height: "90vh", overflowY: "auto", overflowX: "hidden" }}
          >
            {state.map((toast) => {
              return (
                <div className="p-2" key={toast.id}>
                  <Toast
                    id={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onRemove={() => handleRemoveToast(toast.id, 500)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {props.children}
    </ToastContext.Provider>
  );
}
