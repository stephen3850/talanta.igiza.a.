'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  FileText,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  Edit,
  Globe
} from 'lucide-react';

export default function AdminAiKnowledgePage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editArticleId, setEditArticleId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('STADIUM_OVERVIEW');
  const [content, setContent] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/visitor-assistant/knowledge');
      const json = await res.json();
      if (json.success) {
        setArticles(json.articles);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSaveArticleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const keywords = keywordsInput.split(',').map((k) => k.trim()).filter(Boolean);
      const res = await fetch('/api/ai/visitor-assistant/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editArticleId,
          category,
          title,
          content,
          keywords,
          published,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditArticleId(null);
        setTitle('');
        setContent('');
        fetchArticles();
      }
    } catch (err) {
      console.error('Failed to save article:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenNewModal = () => {
    setEditArticleId(null);
    setTitle('');
    setContent('');
    setKeywordsInput('stadium, information');
    setCategory('STADIUM_OVERVIEW');
    setPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (article) => {
    setEditArticleId(article.id);
    setTitle(article.title);
    setCategory(article.category);
    setContent(article.content);
    setKeywordsInput(article.keywords ? article.keywords.join(', ') : '');
    setPublished(article.published);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/ai-assistant">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">KNOWLEDGE BASE EDITOR</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{articles.length} Articles</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Grounded Information Article Registry
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={handleOpenNewModal}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Create Article</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchArticles}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Articles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            className="bg-navy-900 border border-navy-800 hover:border-slate-700 transition-all rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">{art.id}</span>
                <Badge variant="info" size="sm">{art.category.replace('_', ' ')}</Badge>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{art.title}</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{art.content}</p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {art.keywords?.map((kw, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-[9px] font-mono text-slate-400">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">Author: {art.author}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(art)}
                className="text-xs py-1"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                <span>Edit Article</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Save / Edit Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editArticleId ? 'Edit Knowledge Base Article' : 'Create Grounded Knowledge Article'}
      >
        <form onSubmit={handleSaveArticleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Article Title *</label>
            <input
              type="text"
              placeholder="e.g. Turnstile Gate B Entry Instructions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="STADIUM_OVERVIEW">STADIUM_OVERVIEW</option>
              <option value="EVENTS_AND_FIXTURES">EVENTS_AND_FIXTURES</option>
              <option value="TICKETING_PRICING">TICKETING_PRICING</option>
              <option value="PAYMENTS_MPESA">PAYMENTS_MPESA</option>
              <option value="DIGITAL_PASSES_GATES">DIGITAL_PASSES_GATES</option>
              <option value="FACILITIES_ACCESSIBILITY">FACILITIES_ACCESSIBILITY</option>
              <option value="SUPPORT_CONTACT">SUPPORT_CONTACT</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Grounded Fact Content *</label>
            <textarea
              rows={4}
              placeholder="Provide exact, verified stadium factual information..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Search Target Keywords (Comma-separated)</label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              Save & Publish Article
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
