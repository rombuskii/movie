import axios from "axios";

export const getMovie = async(id) => {
    const {data} = await axios.get(`https://consumet-pied.vercel.app/movies/flixhq/info?id=${id}`);
    const ids = data.id;
    const image = data.image
    return {ids, image};
}