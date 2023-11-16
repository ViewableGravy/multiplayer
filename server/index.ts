const port = 3000;
const basePath = import.meta.dir + "/../client/build/";

const getFile = (path: string) => {
    if (path === "/")
        return Bun.file(`${basePath}/index.html`);

    if (path.startsWith("/"))
        path = path.substring(1);

    return Bun.file(`${basePath}${path}`);
};

Bun.serve({
    port: port,
    fetch: async (req) => {
        const url = new URL(req.url);
        const file = getFile(url.pathname);
        const exists = await file.exists();

        if (!exists) {
            return new Response("Not found", {
                status: 404
            });
        }

        return new Response(file);
    }
});

console.log(`Server started on port ${port}`);