export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Akses hanya untuk admin" });
  next();
};

export const isKasir = (req, res, next) => {
  if (req.user.role !== "kasir")
    return res.status(403).json({ message: "Akses hanya untuk kasir" });
  next();
};

export const isCapster = (req, res, next) => {
  if (req.user.role !== "capster")
    return res.status(403).json({ message: "Akses hanya untuk capster" });
  next();
};
