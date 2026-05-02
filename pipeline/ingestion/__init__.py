"""Pluggable ingestion sources for the GVRAT pipeline.

Usage in main.py:
    from pipeline.ingestion import CsvSource, ApiSource
"""
from pipeline.ingestion.csv_source import CsvSource
from pipeline.ingestion.base import Source

__all__ = ["Source", "CsvSource"]
