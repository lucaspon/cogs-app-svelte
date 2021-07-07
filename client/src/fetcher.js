// get data
export default async function getData(path) {
    let response = await fetch(path, { method: 'GET' });
    let data = await response.json();
    // console.log(data);
    return data
}

// get specific

// update specific

// post new

// delete
