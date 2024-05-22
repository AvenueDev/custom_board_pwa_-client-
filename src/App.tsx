import { Route, Routes, useNavigate } from "react-router-dom";
import styles from "../src/styles/App.module.css";
import Home from "./routes/Home";
import News from "./routes/News";
import { IoSearch } from "react-icons/io5";
import { GoSun, GoMoon, GoSignIn } from "react-icons/go";
import { FaNewspaper, FaYoutube, FaInstagram, FaBookmark } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { setInputValue } from "./store/inputValueSlice";
import { Article } from "./types/types";
import { useEffect, useState } from "react";
import { setNewsData } from "./store/newsDataSlice";
import { setIconIndex } from "./store/iconIndexSlice";
import SearchModal from "./components/SearchModal";
import { setSearchModalTrigger } from "./store/searchModalTriggerSlice";
import { setDarkLight } from "./store/darkLightSlice";

function App(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const inputValue = useSelector((state: RootState) => state.inputValue);
  const [toggle, setToggle] = useState<number>(1);
  const iconIndex = useSelector((state: RootState) => state.iconIndex);
  const searchModalTrigger = useSelector((state: RootState) => state.searchModalTrigger);
  const darkLightToggle = useSelector((state: RootState) => state.darkLight);

  const stripHtml = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.innerText;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setInputValue(e.target.value));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    iconIndex === -1 ? dispatch(setSearchModalTrigger(true)) : null;
    e.preventDefault();
    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetch(process.env.REACT_APP_GET_NEWS_API_URL as string, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify({ inputValue }),
        });
        const result = await response.json();

        const textData = result.map(
          (item: Article): Article => ({
            title: stripHtml(item.title),
            description: stripHtml(item.description),
            pubDate: stripHtml(item.pubDate),
            originallink: stripHtml(item.originallink),
            imageUrls: item.imageUrls,
            articleText: stripHtml(item.articleText),
          }),
        );

        dispatch(setNewsData(textData));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  };

  const navItem = [
    { path: "/news", icon: <FaNewspaper />, label: "News" },
    { path: "/youtube", icon: <FaYoutube />, label: "Youtube" },
    { path: "/instagram", icon: <FaInstagram />, label: "Instagram" },
    { path: "/x", icon: <FaXTwitter />, label: "X" },
    { path: "/bookmark", icon: <FaBookmark />, label: "Bookmark" },
  ];

  const themeExchange = () => {
    if (darkLightToggle === "dark") {
      dispatch(setDarkLight("light"));
      localStorage.setItem("theme", "light");
    } else {
      dispatch(setDarkLight("dark"));
      localStorage.setItem("theme", "dark");
    }
  };

  useEffect(() => {
    localStorage.getItem("theme") === "dark" ? dispatch(setDarkLight("dark")) : dispatch(setDarkLight("light"));
  }, [dispatch]);

  console.log(darkLightToggle);

  return (
    <div
      className={darkLightToggle === "dark" ? "" : styles.lightMode}
      data-theme={darkLightToggle === "dark" ? "" : "light"}
    >
      <div className={styles.modalSet} style={searchModalTrigger === true ? { display: "block" } : {}}>
        <SearchModal />
        <div className={styles.overlay} role="button" onClick={() => dispatch(setSearchModalTrigger(false))} />
      </div>
      <div className={styles.circle1} />
      <div className={styles.circle2} />
      <div className={styles.circle3} />
      <div className={styles.circle4} />
      <div className={styles.mainContainer}>
        <header className={styles.header}>
          <h1
            className={styles.logo}
            onClick={() => {
              dispatch(setIconIndex(-1));
              navigate("/");
            }}
          >
            Custom Board
          </h1>

          <form onSubmit={inputValue ? onSubmit : (e) => e.preventDefault()}>
            <div className={styles.searchBar}>
              <input
                type="text"
                onChange={onChange}
                value={inputValue}
                placeholder="Search"
                spellCheck="false"
                autoComplete="off"
              />
              <div
                role="button"
                className={styles.clearBtn}
                onClick={() => dispatch(setInputValue(""))}
                style={inputValue === "" ? { display: "none" } : { display: "block" }}
              >
                <span className={`${styles.iconSet} ${styles.part1}`}></span>
                <span className={`${styles.iconSet} ${styles.part2}`}></span>
              </div>
              <button className={styles.searchIconBox} type="submit">
                <IoSearch className={styles.searchIcon} />
              </button>
            </div>
          </form>

          <button className={styles.darkModeBtn} style={{ opacity: `${toggle}` }} onClick={themeExchange}>
            {darkLightToggle === "dark" ? (
              <GoSun className={styles.darkModeIcon} onClick={() => {}} />
            ) : (
              <GoMoon className={styles.darkModeIcon} />
            )}
          </button>

          <button className={styles.signInBtn} onMouseOver={() => setToggle(0)} onMouseOut={() => setToggle(1)}>
            <GoSignIn className={styles.signInIcon} />
            <span>Sign in</span>
          </button>
        </header>

        <nav className={styles.navbar}>
          <ul>
            {navItem.map((item, index) => {
              return (
                <li
                  className={iconIndex === index ? `${styles.menuIcon}` : ""}
                  key={index}
                  onClick={() => {
                    dispatch(setIconIndex(index));
                    navigate(`${item.path}`);
                  }}
                >
                  <div>{item.icon}</div>
                  <span className={iconIndex === index ? `${styles.menuText}` : ""}>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
