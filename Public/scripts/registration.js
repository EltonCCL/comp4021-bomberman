const Registration = (function () {
    // This function sends a register request to the server
    // * `username`  - The username for the sign-in
    // * `avatar`    - The avatar of the user
    // * `name`      - The name of the user
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const register = function (username, avatar, name, password, onSuccess, onError) {





        const json = JSON.stringify({ username, avatar, name, password });
        console.log(json);


        fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: json
        })
            .then((res) => res.json())
            .then((json) => {
                if (json.status == "error") {
                   if(onError) onError(json.error);
                }
                else{
                    if(onSuccess) onSuccess();
                }
            })
            .catch((err) => {
                console.log("Error!");
            });



    };

    return { register };
})();
