import React, { useContext, useState } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import styles from "../../../styles/auth/auth.module.scss";
import { buttonTypes } from "../../shared/button/utils";
import Button from "../../shared/button/button";
import AuthActionCard from "../auth-action-card/authActionCard";
import { Link, useHistory } from "react-router-dom";
import Input from "../../shared/input/input";
import ErrorMessage from "../../shared/error-message/errorMessage";
import { toast_actions, toast_types } from "../../shared/toast/utils/toast";
import { getErrorMessage } from "../../../api/utils/mapFirebaseError";
import { AddCookie } from "../../../utils/cookies";
import { ToastContext } from "../../../context/toastContext";

export default function Login() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const history = useHistory();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [signInUsingGoogleloading, setSignInUsingGoogleLoading] =
    useState(false);
  const [
    signInUsingEmailAndPasswordloading,
    setSignInUsingEmailAndPasswordLoading,
  ] = useState(false);
  const dispatch = useContext(ToastContext);
  const [inlineError, setInlineError] = useState({
    email_error: "",
    password_error: "",
  });
  // use this function to check the email
  function checkEmail() {
    if (!email) {
      setInlineError((inlineError) => ({
        ...inlineError,
        email_error: "email cannot be empty",
      }));
      return false;
    }
    return true;
  }

  function checkPassword() {
    if (!password) {
      setInlineError((inlineError) => ({
        ...inlineError,
        password_error: "password cannot be empty",
      }));
      return false;
    }

    return true;
  }

  function handleLoginWithEmailAndPassword(e) {
    e.preventDefault();
    const allCheckPassed = [checkEmail(), checkPassword()].every(Boolean);
    if (!allCheckPassed) {
      return;
    }
    setSignInUsingEmailAndPasswordLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        handleRedirect(result.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = getErrorMessage(errorCode);
        dispatch({
          type: toast_actions.ADD_TOAST,
          payload: {
            id: Math.floor(Math.random() * 100),
            type: toast_types.error,
            message: errorMessage,
          },
        });
      })
      .finally(() => setSignInUsingEmailAndPasswordLoading(false));
  }
  function handleLoginWithGoogle() {
    setSignInUsingGoogleLoading(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        handleRedirect(result.user);
      })
      .catch((error) => {
        const errorMessage = error.message;
        dispatch({
          type: toast_actions.ADD_TOAST,
          payload: {
            id: Math.floor(Math.random() * 100),
            type: toast_types.error,
            message: errorMessage,
          },
        });
      })
      .finally(() => setSignInUsingGoogleLoading(false));
  }
  function handleRedirect(user) {
    const { displayName, email, photoURL, accessToken, uid } = user;
    AddCookie("token", accessToken);
    AddCookie(
      "user",
      JSON.stringify({ name: displayName, id: uid, email, photoURL })
    );
    history.push("/application");
  }
  const loginForm = (
    <div className={styles.auth_form}>
      <form onSubmit={handleLoginWithEmailAndPassword}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter Email"
          label_name="Email"
          autoComplete="off"
          has_error={inlineError.email_error}
          onChange={(event) => {
            setEmail(event.target.value);
            setInlineError((inlineError) => ({
              ...inlineError,
              email_error: "",
            }));
          }}
          onBlur={checkEmail}
          required
        />
        {inlineError.email_error && (
          <ErrorMessage>{inlineError.email_error}</ErrorMessage>
        )}
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter Password"
          label_name="Password"
          autoComplete="off"
          has_error={inlineError.password_error}
          onChange={(event) => {
            setPassword(event.target.value);
            setInlineError((inlineError) => ({
              ...inlineError,
              password_error: "",
            }));
          }}
          onBlur={checkPassword}
          required
        />
        {inlineError.password_error && (
          <ErrorMessage>{inlineError.password_error}</ErrorMessage>
        )}
        <div className="py-3 text-center">
          <Button
            isloading={signInUsingEmailAndPasswordloading ? 1 : 0}
            disabled={
              signInUsingGoogleloading || signInUsingEmailAndPasswordloading
            }
            button_type={buttonTypes.primary}
            button_hover_type={buttonTypes.primary_hover}
            button_text="Login"
            type="submit"
          />
        </div>
        <hr style={{ margin: "5px 0", border: "1px solid #ddd" }} />
        <div className="py-3 text-center">
          <Button
            isloading={signInUsingGoogleloading ? 1 : 0}
            disabled={
              signInUsingGoogleloading || signInUsingEmailAndPasswordloading
            }
            button_type={buttonTypes.primary}
            button_hover_type={buttonTypes.primary_hover}
            button_text="Login with google"
            onClick={handleLoginWithGoogle}
          />
        </div>
      </form>
    </div>
  );
  const navigation_link = (
    <div className="py-2 text-center">
      <p className={styles.navigation_link_label}>Do not have an account</p>
      <Link to="/sign-up" className={styles.navigation_link}>
        Sign Up
      </Link>
    </div>
  );
  return (
    <AuthActionCard action_form={loginForm} navigation_link={navigation_link} />
  );
}
