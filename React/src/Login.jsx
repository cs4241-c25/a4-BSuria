import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import "nes.css/css/nes.min.css";
import './Login.css'

function Login() {
    const [count, setCount] = useState(0)

    return (
        <>
            <section className="nes-container is-rounded">
                <h1>Playtime Leaderboard</h1>
                <div className="nes-container is-rounded is-dark">
                    <form className="nes-container is-dark with-title" action="/React/public" method="post">
                        <h1 className="title">Login</h1>
                        <div className="button-container">
                            <button id="loginbutton" type="submit" className="nes-btn is-primary is-dark" onClick={(event) => submit(event, "this")}>
                                <i className="nes-icon github is-large"></i>
                                <p>Sign in with GitHub</p>
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}

const submit = async function( event, where ) {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    //console.log(where)

    //const entry_1 = document.querySelector( '[name="entry"]:checked')

    /*const entry_2 = document.querySelector( "#entry_2"),
        json_entry_2 = { entry_2: entry_2.value },
        entry_2_body = JSON.stringify( json_entry_2 )*/

    const form = event.target.closest('form');

    if (form.checkValidity()) {
        event.preventDefault();

        window.location.href = "http://localhost:3000/auth/github";
    } else {
        console.log('Form is invalid.');
    }

}

export default Login
