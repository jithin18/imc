const oracledb = require("oracledb");

async function testCQN1() {
    const connection = await oracledb.getConnection({
        user: "cpaas_web",
        password: "cpaas_web",  // mypw contains the hr schema password
        connectString: "orcl_178",
        events: true
    });

    // console.log("connection data : ", connection);

    function myCallback(message) {
        console.log("Callback data : ", message);
    }

    const options = {
        sql: `SELECT * FROM TEST_CQN`,  // query of interest
        callback: myCallback                // method called by notifications
    };

    await connection.subscribe('mysub', options);

}

testCQN1();