'use client';
import { CiSearch } from 'react-icons/ci';
import { FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './TopBar.module.css';

export default function TopBar() {
  const isLoggedIn = true; // will replace with real auth check
  const router = useRouter();

  const handleLocationClick = () => {
    router.push('/client/homepage/location');
  };

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.inner}>
          {/* Left: Logo / Location */}
          <div className={styles.logoWrapper}>
            {isLoggedIn ? (
              <div
                className={styles.userLocation}
                onClick={handleLocationClick}
              >
                <span>신림동</span>
                <FaChevronDown className={styles.dropdownIcon} />
              </div>
            ) : (
              <Image
                src="/images/logo/pet-saves.png"
                alt="Pet Save Logo"
                width={60}
                height={40}
                className="object-contain"
              />
            )}
          </div>

          {/* Right: Icons */}
          <div className={styles.icons}>
            <button className={styles.iconBtn}>
              <Image
                src="/images/icons/Bell.svg"
                alt="Notification"
                width={27}
                height={30}
                className={styles.logo}
              />
            </button>
            <button className={styles.iconBtn}>
              <Image
                src="/images/icons/Cart.png"
                alt="Cart"
                width={27}
                height={30}
                className="object-contain"
              />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <CiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="검색어를 입력해 주세요"
            className={styles.searchInput}
          />
        </div>
      </header>
    </>
  );
}
