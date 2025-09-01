'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import Image from 'next/image';

import styles from './styles.module.css';

type Location = {
  id: number;
  name: string;
  district: string;
  city: string;
  province: string;
};

export default function LocationPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState('');

  // Mock API fetch
  useEffect(() => {
    const fetchLocations = async () => {
      await new Promise((res) => setTimeout(res, 500));

      const mockData: Location[] = [
        {
          id: 1,
          name: 'Wonder 1-dong',
          district: 'Dog-u',
          city: 'Ayang-si',
          province: 'Gyonggi',
        },
        {
          id: 2,
          name: 'Anang-dong',
          district: 'Do-n’t',
          city: 'Do-n’t',
          province: '',
        },
        {
          id: 3,
          name: 'Example-dong',
          district: 'Example-gu',
          city: 'Example-si',
          province: 'Gyonggi',
        },
        {
          id: 4,
          name: 'Example-dong',
          district: 'Example-gu',
          city: 'Example-si',
          province: 'Gyonggi',
        },
        {
          id: 5,
          name: 'Example-dong',
          district: 'Example-gu',
          city: 'Example-si',
          province: 'Gyonggi',
        },
        {
          id: 6,
          name: 'Example-dong',
          district: 'Example-gu',
          city: 'Example-si',
          province: 'Gyonggi',
        },
        {
          id: 7,
          name: 'Example-dong',
          district: 'Example-gu',
          city: 'Example-si',
          province: 'Gyonggi',
        },
        {
          id: 8,
          name: 'Test-dong',
          district: 'Test-gu',
          city: 'Test-si',
          province: 'Seoul',
        },
      ];

      setLocations(mockData);
    };

    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Back button */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => router.push('/client/pages/homepage')}
        >
          <FaChevronLeft className={styles.backIcon} />
        </button>
      </div>

      {/* Search input with icon */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            placeholder="Bonvolu serĉi la saman nomon (urbeto, vilaĝo)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <CiSearch className={styles.searchIcon} />
        </div>
        <button className={styles.currentBtn}>
          <Image
            src="/images/icons/mage_location.png"
            alt="Location Icon"
            height={16}
            width={16}
            className="object-contain"
          />
          현재위치로 찾기
        </button>
      </div>

      {/* Locations list */}
      <ul className={styles.locationList}>
        {filteredLocations.map((loc) => (
          <li key={loc.id} className={styles.locationItem}>
            <strong>{loc.name}</strong> - {loc.district}, {loc.city},{' '}
            {loc.province}
          </li>
        ))}
        {filteredLocations.length === 0 && <li>검색 결과가 없습니다.</li>}
      </ul>
    </div>
  );
}
