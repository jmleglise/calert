export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === "/") {
    // Aujourd'hui
    return Response.redirect(`${url.origin}/fr/`, 308);
  }

  return context.next();
}


// const lang = context.request.headers.get("accept-language") ?? "";

//if (lang.startsWith("en")) {
//    return Response.redirect(`${url.origin}/en/`, 308);
//}

// return Response.redirect(`${url.origin}/fr/`, 308);


//if (cookie === "en") ...
//if (cookie === "fr") ...